var RBAC = require('capstone-accesscontrol');
var async = require('async');
var validator = require('validator');

const Operation = {
    UPDATE_ANY: 'updateAny',
    UPDATE_OWN: 'updateOwn',
}

var verifyReferences = (req, relation, resource, callback) => {

    if (typeof resource != 'undefined' && resource != '') {
        var capstone = req.capstone;
        var applog = capstone.get('applog');
        var seclog = capstone.get('seclog');

        var rules = capstone.get('access rules');
        if (rules == '')
            callback(null, true);
        else {
            var ac = new RBAC(rules);
                
            var user = req.user.email;
            var profile = req.profile;
            var roles;
            if (Array.isArray(profile))
                roles = profile.join(';');
            else
                roles = profile;

            var resourceModel = capstone.list(relation.refList.key);
            // Diferentemente de 'item', body não vem com 'id' no atributo
            var resourceId = resource;
            resourceModel.model.findById(resourceId, (err, resourceItem) => {
                var relationResourceName = req.list.path + '.' + relation.path;
                if (err) {
                    var reason = `user: ${user}, resourceModel: ${relation.refList.key}, resourceId: ${resourceId}, reason: Error reading ${relationResourceName}, id: ${resourceId} - ${err}`
                    applog.error(reason);
                    callback(null, true);
                }
                if (resourceItem) {
                    var resourceValue = (resourceModel.autokey) ? resourceItem[resourceModel.autokey.path] : '_id';
                    if (ac.can(roles).referenceAny(relationResourceName, resourceValue).granted) {
                        seclog.info(`user: ${user}, roles: ${roles}, relationResourceName: ${relationResourceName}, resourceModel: ${relation.refList.key}, resourceId: ${resourceId}, resource: ${resourceValue}, id: ${resource}, reason: authorized`);
                        callback(null, true);
                    }
                    else {
                        var message = `Not authorized to '${relation.label}' - '${resourceValue}'`;
                        var reason = `user: ${user}, roles: ${roles}, relationResourceName: ${relationResourceName}, resourceModel: ${relation.refList.key}, resourceId: ${resourceId}, reason: ${message}`
                        seclog.warn(reason);
                        var err = { message: `${message}`, detail: reason};
                        callback(err, false);
                    }        
                }
                else {
                    var reason = `user: ${user}, resourceModel: ${relation.refList.key}, resourceId: ${resourceId}, reason: ${relationResourceName}, id: ${resourceId} - not found`
                    applog.error(reason);
                    callback(null, true);
                }
            });  
        }
    }
    else 
        callback(null, true);

}

var hasOwnership = (roles, req, item) => {

    var capstone = req.capstone;

    var rules = capstone.get('access rules');
    if (rules == {})
        return true
    else {
        var ac = new RBAC(rules);

        var seclog = capstone.get('seclog');

        if (ac.can(roles)[Operation.UPDATE_ANY](req.list.path).granted)
            return true;
        else if (ac.can(roles)[Operation.UPDATE_OWN](req.list.path).granted) {
            if (!item.createdBy) {
                var message = `Item has no owner and user has no ownership permission to resource: '${req.list.path}'`
                var error = `user: ${req.user.email}, roles: ${roles}, resourceName: ${req.list.path}, reason: ${message}`
                seclog.warn(error);

                return false;
            }
            else if (req.list.model.modelName == capstone.get('user model')) {
                if (item.email === req.user.email)
                    return true;
                else if (item.createdBy.toHexString() != req.user.id) {
                    var message = `User is not the resource '${req.list.path}' item owner`
                    var error = `user: ${req.user.email}, roles: ${roles}, resourceName: ${req.list.path}, reason: ${message}`
                    seclog.warn(error);

                    return false;
                }
                else {
                    return true;
                }
            }
            else if (item.createdBy.toHexString() != req.user.id) {
                var message = `User is not the resource '${req.list.path}' item owner`
                var error = `user: ${req.user.email}, roles: ${roles}, resourceName: ${req.list.path}, reason: ${message}`
                seclog.warn(error);

                return false;
            }
            else 
                return true;
        }
        else {
            var message = `User has no ownership permission to resource '${req.list.path}'`;
            var error = `user: ${req.user.displayName}, roles: ${roles}, resourceName: ${req.list.path}, reason: ${message}`;
            seclog.warn(error);

            return false;
        }
    }

}

var hasAttributesPermissions = (roles, req, item) => {

    const 
        capstone = req.capstone
        rules = capstone.get('validation rules');

    let message = '';

    roles.split(',').every((role) => {
        if (rules[role])
            if (req.list.path == Object.keys(rules[role])[0]) {
                rules[role][Object.keys(rules[role])[0]].every((validation) => {
                    const option = Object.keys(validation)[0]
                    switch(option) {
                        case 'isIn':
                            const condition = Object.values(validation)[0].valid;
                            const attribute = Object.keys(Object.values(validation)[0])[1];
                            const values = Object.values(Object.values(validation)[0])[1];
                            const input = req.body[attribute]
                            if (validator.isIn(input, values) ? condition : !condition)
                                message = '';
                            else
                                message = `Role "${role}" can't assign "${req.body[attribute]}" to "${attribute}"`;
                            break;
                        default:
                            message = `Rule "${validation}" not implemented`;
                    }
                    if (message)
                        return false;
                    return true;
                });
            }
        if (message)
            return false;
        return true;
    });

    return message;

}

exports.accessGranted = (req, callback) => {

    var capstone = req.capstone;
    var applog = capstone.get('applog');
    var seclog = capstone.get('seclog');
    
    var user = req.user.email;
    var profile = req.profile;
    var roles;
    if (Array.isArray(profile))
        roles = profile.join(';');
    else
        roles = profile;
    
    try {
        if (req.params.id)
            req.list.model.findById(req.params.id, (err, item) => {
                if (err) 
                    callback( { error: 'access error', detail: err.message }, null );
                else if (!item) 
                    callback( { error: 'access error', detail: `Item ${req.params.id} not found` }, null );
                else if (!hasOwnership(roles, req, item))
                    callback({ error: 'no permission to this item', detail: `'no permission to item ${req.params.id}'` }, null );
                else 
                    var attributesPermissions = hasAttributesPermissions(roles, req, item)
                    if (attributesPermissions)
                        callback({ error: `'${attributesPermissions}'`, detail: 'processing validation rules' }, null );
                    else {
                        async.every(req.list.relationshipFields, (relation, relationCallback) => {
                            var resources = [];
                            if (Array.isArray(req.body[relation.path]))
                                resources = req.body[relation.path];
                            else
                                resources[0] = req.body[relation.path];

                            async.every(resources, (resource, bodyCallback) => {
                                verifyReferences(req, relation, resource, bodyCallback);
                            }, (err, result) => {
                                relationCallback(err, result);
                            });
                        }, (err, result) => {
                            if (err) callback({ error: err.message, detail: err.detail }, null);
                            else async.every(req.list.relationshipFields, (relation, relationCallback) => {
                                var resources = [];
                                if (Array.isArray(item[relation.path]))
                                    resources = item[relation.path];
                                else
                                    resources[0] = item[relation.path];
                                
                                async.every(resources, (resource, resourceCallback) => {
                                    verifyReferences(req, relation, resource, resourceCallback)
                                }, (err, result) => {
                                    relationCallback(err, result);
                                });
                            }, (err, result) => {
                                if (err) callback({ error: err.message, detail: err.detail }, null);
                                else if (result) callback(null, item);
                            });
                        });
                    }
            });
        else
            async.every(req.list.relationshipFields, (relation, relationCallback) => {
                /**
                 * Observar que, se o relacionamento não foi fornecido na tela de inclusão ('required = True'
                 * no esquema), então esta rotina não vai conseguir validar a entrada e não será possível
                 * incluir registros na base de dados, exceto se houver um valor "default", que não funcionou
                 * nesta implementação e não temos tempo de descobrir porque.
                 */
                var resources = [];
                if (Array.isArray(req.body[relation.path]))
                    resources = req.body[relation.path];
                else
                    resources[0] = req.body[relation.path];

                if (resources)
                    async.every(resources, (resource, bodyCallback) => {
                        verifyReferences(req, relation, resource, bodyCallback);
                    }, (err, result) => {
                        relationCallback(err, result);
                    });
                else
                    relationCallback(null, true);
            }, (err, result) => {
                if (err) callback({ error: err.message, detail: err.detail }, null);
                else if (result) callback(null, null);
            });
    }
    catch(e) {
        applog.error(e.message);
        seclog.error(e.message);
        throw new Error(e);
    }

}

exports.accessGrantedList = (op, req, callback) => {
    
    var capstone = req.capstone;
    var applog = capstone.get('applog');
    var seclog = capstone.get('seclog');
    
    var user = req.user.email;
    var profile = req.profile;
    var roles;
    if (Array.isArray(profile))
        roles = profile.join(';');
    else
        roles = profile;
    
	var ids = req.body.ids || req.body.id || req.params.id;
	if (typeof ids === 'string') {
		ids = ids.split(',');
	}
	if (!Array.isArray(ids)) {
		ids = [ids];
	}

    try {
    
        req.list.model.find().where('_id').in(ids).exec((err, results) => {
            if (err)
                callback(err, null)
            else {
                var itemList = [];
                async.every(results, (item, itemCallback) => {
                     if (!hasOwnership(roles, req, item))
                        itemCallback({ error: 'no permission to this item', detail: `'no permission to item ${req.params.id}'` }, null );
                    else {
                        async.every(req.list.relationshipFields, (relation, relationCallback) => {
                            var resources = [];
                            if (Array.isArray(item[relation.path]))
                                resources = item[relation.path];
                            else
                                resources[0] = item[relation.path];

                            async.every(resources, (resource, resourceCallback) => {
                                verifyReferences(req, relation, resource, resourceCallback);
                            }, (err, result) => {
                                relationCallback(err, result);
                            });
                        }, (err, result) => {
                            itemList.push(item);
                            itemCallback(err, result);
                        });
                    }
                }, (err, result) => {
                    if (err) callback({ error: err.message, detail: err.detail }, null);
                    else if (result) callback(null, itemList);
                });
            }
        });
    }
    catch(e) {
        applog.error(e.message);
        seclog.error(e.message);
        throw new Error(e);
    }

}
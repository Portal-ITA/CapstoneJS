
async function translate (text, translator, target = 'en', source = 'pt', format = 'html') {
		try {
				const response = await fetch(translator, {
						method: 'POST',
						body: JSON.stringify({
								q: text,
								source: source,
								target: target,
								format: format,
								api_key: ""
						}),
						headers: { 'Content-Type': 'application/json' }
				});
				if (!response.ok) {
						const errorBody = await response.text();
						console.error(`Erro na API (${response.status}):`, errorBody);
						return null;
				}
				const data = await response.json();
				return data.translatedText;
		}
		catch (e) {
				console.error("Falha na conexão com LibreTranslate:", e);
				return null;
		}
}

async function preTranslation(result, translator) {
		if (!result) return
		if (!translator) return

		for (const pathName of Object.keys(result.schema.paths)) {
				if (pathName.endsWith('.pt')) {
						const originalText = result.get(pathName)
						const translationPath = pathName.slice(0, -3) + ".en"
						var translatedText = result.get(translationPath)
						if (originalText && !translatedText) {
								fieldType = 'html'
								translatedText = await translate(originalText, translator)
								console.log(originalText, ' -> ',translatedText)
								result.set(translationPath, translatedText)
						}
				}
		}

		return result
}

module.exports = function (req, res) {

    var capstone = req.capstone;
    if (!capstone.security.csrf.validate(req)) {
        return res.apiError(403, 'invalid csrf');
    }

    try {
        capstone.accessGranted(req, (err, item) => {
            if (err) return res.status(401).json({ error: err.error, detail: err.detail });
            if (!item) return res.status(404).json({ error: 'not found', id: req.params.id });
            item.setLanguage(capstone.session.getLanguage(req));
            req.list.updateItem(item, req.body, { files: req.files, user: req.user }, function (err) {
                if (err) {
                    var status = err.error === 'validation errors' ? 400 : 500;
                    var error = err.error === 'database error' ? err.detail : err;
                    res.apiError(status, error);
                }
                // Reload the item from the database to prevent save hooks or other
                // application specific logic from messing with the values in the item
                req.list.model.findById(req.params.id).then((updatedItem, err) => {
                    updatedItem.setLanguage(capstone.session.getLanguage(req));
										preTranslation(updatedItem, capstone.get('translator')).then((translated) => {
	                    res.status(200).json(req.list.getData(translated));
										})
                });
            });
        });
    }
    catch(e) {
        var reason = `Error verifying access to '${req.list.path}'`
        return res.status(500).json({ error: e.message, detail: reason });
    }

}

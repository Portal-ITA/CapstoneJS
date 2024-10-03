module.exports = function LanguageRoute (req, res, next) {
    var capstone = req.capstone;
    var lang = req.params.lang;
    try {
        capstone.session.setLanguage(req, lang);
        // TODO: guardar a URL original na sessão ou local da requisição e voltar para lá
        return res.redirect('/' + capstone.get('admin path'));
    }
    catch(e) {
        var reason = `Error setting to language '${lang}'`;
        console.error(reason, e);
        return res.status(500).send(capstone.wrapHTMLError(reason, err.message));
    }
}
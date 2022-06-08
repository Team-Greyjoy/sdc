var controller = require('./controllers');
var router = require('express').Router();

router.get('/meta', controller.meta.get);

router.get('/', controller.get);

router.post('/', controller.post);

router.put('/:review_id/helpful', controller.helpful.put);

router.put('/:review_id/report', controller.report.put);


module.exports = router;
var controller = require('./controllers');
var router = require('express').Router();
require('dotenv').config();

router.get('/reviews/meta', controller.meta.get);

router.get('/reviews', controller.get);

router.post('/reviews', controller.post);

router.put('/reviews/:review_id/helpful', controller.helpful.put);

router.put('/reviews/:review_id/report', controller.report.put);

router.get(`/${process.env.LOADER_IO}/`, (req, res) => {
  res.send(`${process.env.LOADER_IO}`)
})

module.exports = router;
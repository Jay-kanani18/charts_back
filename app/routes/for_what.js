var for_what = require('../controller/for_what'); // include user controller ////

for_what = new for_what()

module.exports = function (app) {
    app.route('/get_for_what').get(for_what.get_for_what);
    app.route('/get_for_what').post(for_what.get_for_what);
    app.route('/add_for_what').post(for_what.add_for_what);
    app.route('/save_for_what').post(for_what.save_for_what);
    app.route('/remove_for_what').delete(for_what.remove_for_what);

}
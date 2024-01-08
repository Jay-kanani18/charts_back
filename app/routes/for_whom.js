let  for_whom = require('../controller/for_whom'); // include user controller ////
for_whom = new for_whom()


module.exports = function (app) {
    app.route('/get_for_whom').get(for_whom.get_for_whom);
    app.route('/add_for_whom').post(for_whom.add_for_whom);
    app.route('/save_for_whom').post(for_whom.save_for_whom);
    app.route('/remove_for_whom').delete(for_whom.remove_for_whom);
}
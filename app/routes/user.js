var users = require('../controller/user'); // include user controller ////


module.exports = function (app) {
    // app.route('/get_charts').get(users.get_charts);
    app.route('/get_users').get(users.get_users);
    app.route('/get_user_detail').get(users.get_user_detail);
    app.route('/update_user').post(users.update_user);
    app.route('/delete_user').delete(users.delete_user);
}
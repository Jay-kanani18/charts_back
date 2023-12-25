let charts = require('../controller/charts'); // include user controller ////
charts = new charts()



module.exports = function (app) {
    app.route('/get_chart_list').get(charts.get_chart_list);
    app.route('/add_charts').post(charts.add_charts);
    app.route('/get_charts_detail').get(charts.get_charts_detail)

}
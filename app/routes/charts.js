let charts = require('../controller/charts'); // include user controller ////
charts = new charts()




module.exports = function (app) {
    // app.route('/get_charts').post(charts.get_chart_list);
    app.route('/get_charts').get(charts.get_chart_list);
    app.route('/add_charts').post(charts.add_charts);
    app.route('/get_charts_detail').post(charts.get_charts_detail)
    app.route('/get_countries').post(charts.get_countries)


    app.route('/API_1').post(charts.API_1)
    app.route('/API_2').post(charts.API_2)
    app.route('/API_3').post(charts.API_3)
    app.route('/API_4').post(charts.API_4)
    app.route('/API_5').post(charts.API_5)
    app.route('/API_6').post(charts.API_6)
    app.route('/API_7').post(charts.API_7)
    app.route('/API_8').post(charts.API_8)
    app.route('/API_9').post(charts.API_9)
    app.route('/API_10').post(charts.API_10)
    app.route('/API_11').post(charts.API_11)
    app.route('/API_12').post(charts.API_12)
    app.route('/API_13').post(charts.API_13)
    app.route('/API_14').post(charts.API_14)
    app.route('/API_15').post(charts.API_15)
  

}
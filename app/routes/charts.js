let charts = require('../controller/charts'); // include user controller ////
charts = new charts()




module.exports = function (app) {
    app.route('/get_charts').get(charts.get_chart_list);
    app.route('/add_charts').post(charts.add_charts);
    app.route('/get_charts_detail').get(charts.get_charts_detail)
    app.route('/get_countries').get(charts.get_countries)


    app.route('/API_1').get(charts.API_1)
    app.route('/API_2').get(charts.API_2)
    app.route('/API_3').get(charts.API_3)
    app.route('/API_4').get(charts.API_4)
    app.route('/API_5').get(charts.API_5)
    app.route('/API_6').get(charts.API_6)
    app.route('/API_7').get(charts.API_7)
    app.route('/API_8').get(charts.API_8)
    app.route('/API_9').get(charts.API_9)
    app.route('/API_10').get(charts.API_10)
    app.route('/API_11').get(charts.API_11)
    app.route('/API_12').get(charts.API_12)
    app.route('/API_13').get(charts.API_13)
    app.route('/API_14').get(charts.API_14)
    app.route('/API_15').get(charts.API_15)
  

}
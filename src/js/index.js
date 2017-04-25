/**
 * Created by chenguojun on 8/10/16.
 */
;
(function ($, window, document, undefined) {
    var token = $.cookie('orange_token');
    if (token == undefined) {
        window.location.href = '../login.html';
    }
    App.token = token;

    var requestMapping = {
        "/api/index": "index"
    };
    App.requestMapping = $.extend({}, App.requestMapping, requestMapping);

    App.index = {
        page: function (title) {
            App.content.empty()
            App.title(title)
            var content = $(
                '<div class="panel-body" >' +
                '<div class="row">' +
                '<div class="col-md-12">' +
                '<div class="panel panel-default">' +
                '<div class="panel-heading">' +
                '<i class="fa fa-bar-chart-o fa-fw"></i>学生' +
                '</div>' +
                '<div class="panel-body" id="index_grid"></div>' +
                '</div>' +
                '</div> ' +
                '</div> ' +
                '</div>')
            App.content.append(content)
            App.index.initEvents()
        }
    };
    /**
     * 初始化事件
     */
    App.index.initEvents = function () {
        var gridOptions = {
            url: App.href + "/api/sys/role/roleUserCount",
            contentType: "chart-bar",
            showContentType: true,
            contentTypeItems: "table,list,chart-bar,chart-pie",
            pageNum: 1,//当前页码
            pageSize: 15,//每页显示条数
            idField: "id",//id域指定
            headField: "roleName",
            showCheck: true,//是否显示checkbox
            checkboxWidth: "3%",
            showIndexNum: true,
            indexNumWidth: "5%",
            pageSelect: [2, 15, 30, 50],
            columns: [
                {
                    title: "角色名称",
                    field: "roleName",
                    chartX: true
                }, {
                    title: "用户数",
                    field: "userCount",
                    chartY: true
                }, {
                    title: "菜单数",
                    field: "functionCount",
                    chartY2: true
                }
            ]
        };
        var grid = App.content.find("#index_grid").orangeGrid(gridOptions);
    };

})(jQuery, window, document);

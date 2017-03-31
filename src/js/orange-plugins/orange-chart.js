/**
 * Created by chenguojun on 2017/3/29.
 */
;
(function ($, window, document, undefined) {
    var getNormalChartOption = function (xData, yData) {
        return {
            legend: {
                x: 'center',
                y: 'bottom',
                data: xData['legend']
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b} <br/> {a}: {c}',
                axisPointer: {
                    type: 'cross',
                    animation: false,
                    label: {
                        borderWidth: 1,
                        shadowBlur: 0,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0
                    }
                }
            },
            grid: {
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xData['data']
            },
            yAxis: {
                type: 'value'
            },
            series: yData
        };
    };
    var getLoadingOption = function () {
        return {
            xAxis: [
                {
                    type: 'category',
                    data: ['1', '2', '3'],
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '',
                    type: 'bar',
                    barWidth: '60%',
                    data: [1, 3, 2]
                }
            ]
        };
    };
    var getFunnelChartOption = function (xData, yData) {
        return {
            tooltip: {
                trigger: 'item',
                formatter: "{a}<br>{b} : {c}"
            },
            legend: {
                selectedMode: 'single',
                data: xData['legend']
            },
            calculable: true,
            series: yData
        };
    };
    var getPieChartOption = function (xData, yData) {
        return {
            legend: {
                x: 'center',
                y: 'bottom',
                selectedMode: 'single',
                data: xData['legend']
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/> {b}: {c} ({d}%)"
            },
            series: yData
        };
    };
    var dateDefaults = {};
    if (typeof(moment) != "undefined") {
        dateDefaults = {
            showDropdowns: true,
            linkedCalendars: false,
            autoApply: false,
            ranges: {
                '今天': [moment().startOf('day'), moment().startOf('day')],
                '昨天': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                '最近七天': [moment().subtract(6, 'days'), moment()],
                '最近三十天': [moment().subtract(29, 'days'), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            locale: {
                "format": 'YYYY-MM-DD HH:mm:ss',
                "separator": " 到 ",
                "applyLabel": "确定",
                "cancelLabel": "取消",
                "fromLabel": "从",
                "toLabel": "到",
                "customRangeLabel": "自定义",
                "daysOfWeek": [
                    "周日",
                    "周一",
                    "周二",
                    "周三",
                    "周四",
                    "周五",
                    "周六"
                ],
                "monthNames": [
                    "一月",
                    "二月",
                    "三月",
                    "四月",
                    "五月",
                    "六月",
                    "七月",
                    "八月",
                    "九月",
                    "十月",
                    "十一月",
                    "十二月"
                ],
                "firstDay": 1
            },
            timePicker: true,
            timePicker24Hour: true,
            timePickerSeconds: true
        };
    }
    var Chart = function (element, options) {
        this._setVariable(element, options);
        this._setOptions(this._options);
        this._initEmpty();
        if (!this._autoLoad)
            return;
        if (this._url !== undefined) {
            this._load();
            return;
        }
        if (this._data !== undefined) {
            this._init();
            return;
        }
        console.error("data或url未定义");
    };
    Chart.defaults = {
        autoLoad: true,
        showSearch: false,
        showLegend: true
    };
    Chart.template = {
        alertTpl: '<div class="alert alert-${type_} alert-dismissable" role="alert">'
        + '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
        + '<strong>提示!</strong>${alert_}</div>',
        searchRowTpl: '<div class="form"><form ele-type="search" role="form">'
        + '<div class="form-body"><div class="row"></div></div>'
        + '<div class="form-actions right" style="background: none;"></div>'
        + '</form></div>',
        searchElementTpl: '<div class="col-md-${span_}"><div class="form-group">'
        + '</div></div>',
        chartWrapperTpl: '<div id="${id_}_wrapper" class="dataTables_wrapper no-footer" style="height: 450px;"></div>',
        chartRowTpl: '<div role="content" class="table-scrollable"></div>',
        labelTpl: '<label>${label_}</label>',
        textTpl: '<input type="text" name="${name_}" id="${id_}" class="form-control ${span_}" placeholder="${placeholder_}" value="${value_}">',
        passwordTpl: '<input type="password" class="form-control ${class_}">',
        selectTpl: '<select name="${name_}" id="${id_}" class="form-control ${class_}"></select>',
        optionTpl: '<option value="${value_}" ${selected}>${text_}</option>',
        checkboxGroupTpl: '<div class="checkbox-list" id="${id_}" name="${name_}"></div>',
        checkboxTpl: '<label>'
        + '<input type="checkbox" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        inlineCheckboxTpl: '<label class="checkbox-inline">'
        + '<input type="checkbox" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        radioGroupTpl: '<div class="radio-list" id="${id_}" name="${name_}"></div>',
        radioTpl: '<label>'
        + '<input type="radio" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        inlineRadioTpl: '<label class="radio-inline">'
        + '<input type="radio" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        displayTpl: '<p class="form-control-static">${text_}</p>',
        buttonTpl: '<button type="${type_}" class="${class_}" title="${title_}" ${attribute_}>${text_}</button>'
    };
    Chart.prototype = {
        _reload: function (options) {
            if (options != undefined) {
                this._options = $.extend(true, {}, this._options, options);
                this._setOptions(this._options, this);
            }
            this._load();
        },
        _setVariable: function (element, options) {
            this.$element = $(element);
            var id = element.id;
            if (id === undefined) {
                id = "chart_" + new Date().getTime();
                this.$element.attr("id", id);
            }
            console.info(this.$element.html());
            this._elementId = id;
            this._options = options;
            this._searchInited = false;
            this.$chartWrapper = {};
        },
        _setOptions: function (options) {
            this._autoLoad = options.autoLoad;
            this._url = options.url;
            this._method = options.method == undefined ? "GET" : options.method;
            this._chartType = options.chartType == undefined ? "pie" : options.chartType;
            this._afterInit = options.afterInit;
            this._chartClick = options.chartClick;
            this._showSearch = options.showSearch;
            this._showLegend = options.showLegend;
            if (options.search != undefined) {
                this._search = options.search;
            }
            if (options.data !== undefined) {
                if (options.data.data !== undefined) {
                    console.error("data格式不正确，必须包含data和total");
                    return;
                }
                this._data = options.data.data;
            }
            this._columns = options.columns;
        },
        _init: function () {
            this._remove();
            this._render();
            this._doAfterInit();
        },
        _doAfterInit: function () {
            if (this._afterInit != undefined)
                this._afterInit();
        },
        _remove: function () {
            if (this.$chartWrapper != undefined) {
                this.$chartWrapper.empty();
            }
        },
        _initEmpty: function () {
            var that = this;
            if (this._showSearch && !this._searchInited) {
                this._renderSearch();
                this._searchInited = true;
            }
            var chartWrapper = $.tmpl(Chart.template.chartWrapperTpl, {
                "id_": that._elementId
            });
            this.$element.append(chartWrapper);
            this.$chartWrapper = chartWrapper;
            chartWrapper.append("努力加载中！");
        },
        _render: function () {
            var that = this;
            if (this._showSearch && !this._searchInited) {
                this._renderSearch();
                this._searchInited = true;
            }
            setTimeout($.proxy(that._renderChart, that), 500);
        },
        _renderSearch: function () {
            var rowEleSpan, items, buttons, hide = false;
            if (this._search == undefined) {
                return;
            } else {
                if (this._search.items != undefined) {
                    items = this._search.items;
                } else {
                    return;
                }
                if (this._search.buttons != undefined) {
                    buttons = this._search.buttons;
                }
                var rowEleNum = this._search.rowEleNum == undefined ? 2
                    : this._search.rowEleNum;
                if (12 % rowEleNum == 0) {
                    rowEleSpan = 12 / rowEleNum;
                }
                if (this._search.hide != undefined) {
                    hide = this._search.hide;
                }
            }
            var that = this;
            var searchFormRow = $.tmpl(Chart.template.searchRowTpl, {});
            if (items.length > 0) {
                $
                    .each(
                        items,
                        function (index, item) {
                            var itemDiv = $.tmpl(
                                Chart.template.searchElementTpl, {
                                    "span_": (item.rowNum > 0 ? item.rowNum * rowEleSpan : rowEleSpan)
                                }).appendTo(searchFormRow);
                            if (item.label != undefined) {
                                var label = $.tmpl(
                                    Chart.template.labelTpl, {
                                        "label_": item.label
                                    });
                                itemDiv.find(".form-group").append(
                                    label);
                            }
                            if (item.type == "text") {
                                var ele = $
                                    .tmpl(
                                        Chart.template.textTpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id),
                                            "placeholder_": (item.placeholder == undefined ? ""
                                                : item.placeholder),
                                            "value_": (item.value == undefined ? ""
                                                : item.value)
                                        });
                                itemDiv.find(".form-group").append(ele);
                            } else if (item.type == "select") {
                                var ele = $
                                    .tmpl(
                                        Chart.template.selectTpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id)
                                        });
                                if (item.items != undefined && item.items.length > 0) {
                                    $.each(
                                        item.items,
                                        function (index, option) {
                                            $
                                                .tmpl(
                                                    Chart.template.optionTpl,
                                                    {
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        }
                                    );
                                }
                                itemDiv.find(".form-group").append(ele);
                                if (item.itemsUrl != undefined) {
                                    $.ajax({
                                            type: (item.method == undefined ? "GET" : item.method),
                                            dataType: "json",
                                            async: false,
                                            url: item.itemsUrl,
                                            success: function (data) {
                                                $.each(
                                                    data,
                                                    function (index,
                                                              option) {
                                                        $
                                                            .tmpl(
                                                                Chart.template.optionTpl,
                                                                {
                                                                    "value_": (option.value == undefined ? ""
                                                                        : option.value),
                                                                    "text_": (option.text == undefined ? ""
                                                                        : option.text)
                                                                })
                                                            .appendTo(
                                                                ele);
                                                    }
                                                );
                                                that._uniform();
                                            },
                                            error: function (err) {
                                                console
                                                    .error("请求错误");
                                            }
                                        }
                                    );
                                }
                            } else if (item.type == "radioGroup") {
                                var ele = $
                                    .tmpl(
                                        Chart.template.radioGroupTpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id)
                                        });
                                $
                                    .each(
                                        item.items,
                                        function (index, option) {
                                            $
                                                .tmpl(
                                                    Chart.template.inlineRadioTpl,
                                                    {
                                                        "name_": (item.name == undefined ? ""
                                                            : item.name),
                                                        "id_": (item.id == undefined ? ""
                                                            : item.id),
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        });
                                itemDiv.find(".form-group").append(ele);
                                if (item.itemsUrl != undefined) {
                                    $
                                        .ajax({
                                            type: "POST",
                                            dataType: "json",
                                            async: false,
                                            url: item.itemsUrl,
                                            success: function (data) {
                                                $
                                                    .each(
                                                        data,
                                                        function (index,
                                                                  option) {
                                                            $
                                                                .tmpl(
                                                                    Chart.template.inlineRadioTpl,
                                                                    {
                                                                        "value_": (option.value == undefined ? ""
                                                                            : option.value),
                                                                        "text_": (option.text == undefined ? ""
                                                                            : option.text)
                                                                    })
                                                                .appendTo(
                                                                    ele);
                                                        });
                                                that._uniform();
                                            },
                                            error: function (err) {
                                                console
                                                    .error("请求错误");
                                            }
                                        });
                                }
                            } else if (item.type == "checkboxGroup") {
                                var ele = $
                                    .tmpl(
                                        Chart.template.checkboxGroupTpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id)
                                        });
                                $
                                    .each(
                                        item.items,
                                        function (index, option) {
                                            $
                                                .tmpl(
                                                    Chart.template.inlineCheckboxTpl,
                                                    {
                                                        "name_": (item.name == undefined ? ""
                                                            : item.name),
                                                        "id_": (item.id == undefined ? ""
                                                            : item.id),
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        });
                                itemDiv.find(".form-group").append(ele);
                                if (item.itemsUrl != undefined) {
                                    $
                                        .ajax({
                                            type: "POST",
                                            dataType: "json",
                                            async: false,
                                            url: item.itemsUrl,
                                            success: function (data) {
                                                $
                                                    .each(
                                                        data,
                                                        function (index,
                                                                  option) {
                                                            $
                                                                .tmpl(
                                                                    Chart.template.inlineCheckboxTpl,
                                                                    {
                                                                        "value_": (option.value == undefined ? ""
                                                                            : option.value),
                                                                        "text_": (option.text == undefined ? ""
                                                                            : option.text)
                                                                    })
                                                                .appendTo(
                                                                    ele);
                                                        });
                                                that._uniform();
                                            },
                                            error: function (err) {
                                                console
                                                    .error("请求错误");
                                            }
                                        });
                                }
                            } else if (item.type == "datepicker") {
                                var dateTpl = '<div class="input-group input-medium">'
                                    + '<input type="text" role="date-input" id="${id_}" name=${name_} value="${value_}" class="form-control">'
                                    + '<span role="icon" class="input-group-addon">'
                                    + '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>' + '</span></div>';
                                if (typeof(moment) == "undefined") {
                                    return $.tmpl(dateTpl, {
                                        "id_": (item.id == undefined ? item.name : item.id),
                                        "name_": item.name,
                                        "cls_": item.cls == undefined ? "" : item.cls,
                                        "value_": ""
                                    });
                                }
                                var ele = $.tmpl(dateTpl, {
                                    "id_": (item.id == undefined ? item.name : item.id),
                                    "name_": item.name,
                                    "cls_": item.cls == undefined ? "" : item.cls,
                                    "value_": (item.value == undefined ? moment().format('YYYY-MM-DD HH:mm:ss') : item.value)
                                });
                                itemDiv.find(".form-group").append(ele);
                                var config = (item.config == undefined ? {} : item.config);
                                var option = $.extend(true, dateDefaults, config);
                                if (item.callback != undefined) {
                                    ele.find('[role="date-input"]').daterangepicker(option, item.callback);
                                } else {
                                    ele.find('[role="date-input"]').daterangepicker(option);
                                }
                                ele.find('span').on("click", function () {
                                    $(this).prev().click();
                                });
                            } else if (item.type == "html") {
                                var ele = item.eleHandle();
                                itemDiv.find(".form-group").append(ele);
                            }
                            searchFormRow.find(".row").append(itemDiv);
                        });
            }
            searchFormRow.append("<hr>");
            if (buttons != undefined && buttons.length > 0) {
                $.each(buttons, function (index, button) {
                    var btn = $.tmpl(Chart.template.buttonTpl, {
                        "class_": (button.cls == undefined ? "btn btn-default"
                            : button.cls),
                        "text_": (button.text == undefined ? "未定义"
                            : button.text),
                        "title_": (button.title == undefined ? button.text
                            : button.title),
                        "type_": (button.type == undefined ? "button"
                            : button.type)
                    });
                    if (button.icon != undefined)
                        btn.prepend("<i class='" + button.icon + "'><i>");
                    if (button.handle != undefined)
                        btn.on("click", function () {
                            button.handle(that);
                        });
                    searchFormRow.find('.form-actions').append(btn);
                    btn.after("&nbsp;");
                });
            }
            if (hide) {
                showBtn = $.tmpl(Chart.template.buttonTpl, {
                    "class_": "btn btn-primary",
                    "text_": "显示搜索面板",
                    "title_": "显示",
                    "type_": "button"
                }).show();
                hideBtn = $.tmpl(Chart.template.buttonTpl, {
                    "class_": "btn btn-warning",
                    "text_": "隐藏搜索面板",
                    "title_": "隐藏",
                    "type_": "button"
                }).hide();
            } else {
                showBtn = $.tmpl(Chart.template.buttonTpl, {
                    "class_": "btn btn-primary",
                    "text_": "显示搜索面板",
                    "title_": "显示",
                    "type_": "button"
                }).hide();
                hideBtn = $.tmpl(Chart.template.buttonTpl, {
                    "class_": "btn btn-warning",
                    "text_": "隐藏搜索面板",
                    "title_": "隐藏",
                    "type_": "button"
                }).show();
            }
            searchFormRow.find('.form-actions').append(showBtn);
            searchFormRow.find('.form-actions').append(hideBtn);
            hideBtn.after("&nbsp;");
            showBtn.on("click", function () {
                searchFormRow.find('.form-body').slideDown();
                showBtn.toggle();
                hideBtn.toggle();
            });
            hideBtn.on("click", function () {
                searchFormRow.find('.form-body').slideUp();
                showBtn.toggle();
                hideBtn.toggle();
            });
            var resetbtn = $.tmpl(Chart.template.buttonTpl, {
                "class_": "btn btn-default",
                "text_": "重置",
                "title_": "重置",
                "type_": "reset"
            });
            searchFormRow.find('.form-actions').append(resetbtn);
            resetbtn.after("&nbsp;");

            var searchbtn = $.tmpl(Chart.template.buttonTpl, {
                "class_": "btn btn-primary",
                "text_": " 搜索",
                "title_": "搜索",
                "type_": "button"
            });
            searchbtn.prepend("<i class='fa fa-search'><i>");
            searchbtn.on("click", function () {
                that._reload();
            });
            searchFormRow.find('.form-actions').append(searchbtn);
            searchbtn.after("&nbsp;");
            this.$element.append(searchFormRow);
            this._uniform();
            this.$searchForm = searchFormRow.find("form[ele-type='search']");
            this.$searchForm.find("input,select").on("change", function () {
                searchbtn.trigger("click");
            });
            if (hide) {
                searchFormRow.find('.form-body').slideUp(1);
            }
        },
        _renderChart: function () {
            var that = this;
            this.$chartWrapper.css("width", that.$element.css("width"));
            var chartType = this._chartType;
            var fullData = {};
            var titleMap = {};
            if (this._data != undefined) {
                if (that._data.length > 0) {
                    $.each(that._data, function (i, grid) {
                        var num = i + 1;
                        $.each(that._columns, function (j, column) {
                            var field = column.field;
                            var data = grid[field];
                            var title = column.title;
                            if (column.format != undefined) {
                                data = column.format(num, grid);
                            }
                            if (column.chartX) {
                                if (fullData['x'] == undefined) {
                                    fullData['x'] = {};
                                }
                                fullData['x'][num] = data;
                            }
                            if (column.chartY) {
                                if (fullData['y'] == undefined) {
                                    fullData['y'] = {};
                                }
                                if (fullData['y'][field] == undefined) {
                                    fullData['y'][field] = {};
                                }
                                if (fullData['y'][field][num] == undefined) {
                                    fullData['y'][field][num] = [];
                                }
                                fullData['y'][field][num].push(data);
                                if (titleMap[field] == undefined) {
                                    titleMap[field] = title;
                                }
                            }
                        });
                    });
                    var chartOption = {};
                    switch (chartType) {
                        case 'pie':
                            var xData = {};
                            xData['data'] = [];
                            xData['legend'] = [];
                            $.each(fullData['x'], function (f, d) {
                                xData['data'].push(d);
                            });
                            var yData = [];
                            $.each(fullData['y'], function (f, d) {
                                xData['legend'].push(titleMap[f]);
                                var dArr = [];
                                $.each(fullData['y'][f], function (sk, sv) {
                                    var name = fullData['x'][sk];
                                    dArr.push({
                                        'name': name,
                                        'value': sv[0]
                                    })
                                });
                                var s = {
                                    name: titleMap[f],
                                    type: chartType,
                                    data: dArr
                                };
                                yData.push(s);
                            });
                            chartOption = getPieChartOption(xData, yData);
                            break;
                        case 'funnel':
                            var xData = {};
                            xData['data'] = [];
                            xData['legend'] = [];
                            $.each(fullData['x'], function (f, d) {
                                xData['data'].push(d);
                            });
                            var yData = [];
                            var i = 0;
                            $.each(fullData['y'], function (f, d) {
                                xData['legend'].push(titleMap[f]);
                                var dArr = [];
                                $.each(fullData['y'][f], function (sk, sv) {
                                    var name = fullData['x'][sk];
                                    dArr.push({
                                        'name': name,
                                        'value': sv[0]
                                    })
                                });
                                var s = {
                                    type: chartType,
                                    name: titleMap[f],
                                    min: 0,
                                    width: '80%',
                                    minSize: '0%',
                                    maxSize: '100%',
                                    sort: 'descending',
                                    data: dArr
                                };
                                yData.push(s);
                                i++;
                            });
                            chartOption = getFunnelChartOption(xData, yData);
                            break;
                        default:
                            var xData = {};
                            xData['data'] = [];
                            xData['legend'] = [];
                            $.each(fullData['x'], function (f, d) {
                                xData['data'].push(d);
                            });
                            var yData = [];
                            $.each(fullData['y'], function (f, d) {
                                xData['legend'].push(titleMap[f]);
                                var dArr = [];
                                $.each(fullData['y'][f], function (sk, sv) {
                                    dArr.push(sv[0])
                                });
                                var s = {
                                    name: titleMap[f],
                                    type: chartType,
                                    width: '80%',
                                    data: dArr
                                };
                                yData.push(s);
                            });
                            chartOption = getNormalChartOption(xData, yData);
                    }
                    if (this._showLegend === false) {
                        chartOption.legend = {};
                    }
                    var chart = echarts.init(document.getElementById(that._elementId + "_wrapper"));
                    chart.setOption(chartOption);
                    chart.on('click', function (params) {
                        if (that._chartClick != undefined)
                            that._chartClick(params);
                    });
                }
            }
        },
        _load: function () {
            if (this._url !== undefined) {
                this._loadData();
            } else {
                this._init();
            }
        },
        _loadData: function () {
            var that = this;
            var parameters = "";
            if (that._url.indexOf("?") != -1) {
                parameters = "&";
            } else {
                parameters = "?";
            }
            $.ajax({
                type: that._method,
                dataType: "json",
                url: that._url + (parameters == undefined ? "" : parameters),
                data: that.$searchForm == undefined ? {} : that.$searchForm.serialize(),
                success: function (data) {
                    if (data.code === 200) {
                        that._data = data.data;
                        that._init();
                    } else if (data.code === 401) {
                        that._alert(data.message + ";请重新登录！", App.redirectLogin);
                    } else {
                        that._alert(data.message);
                    }

                },
                error: function (jqXHR, textStatus, errorMsg) {
                    alert("请求异常！");
                }
            });
        },
        _alert: function (alertText, type, seconds, cb) {
            if (type === undefined) {
                type = "danger";
            }
            if (seconds === undefined) {
                seconds = 3;
            }
            var alertDiv = $.tmpl(Chart.template.alertTpl, {
                "type_": type,
                "alert_": alertText
            });
            this.$element.prepend(alertDiv);
            alertDiv.delay(seconds * 1000).fadeOut();
            App.scrollTo(alertDiv, -200);
            if (cb !== undefined) {
                cb();
            }
        },
        _uniform: function () {
            if (!$().uniform) {
                return;
            }
            var test = $("input[type=checkbox]:not(.toggle), input[type=radio]:not(.toggle)");
            if (test.size() > 0) {
                test.each(function () {
                    $(this).show();
                    $(this).uniform();
                });
            }
        }
    };
    var chart = function (options, callback) {
        if (callback != undefined) {
            options.afterInit = callback;
        }
        options = $.extend(true, {}, Chart.defaults, options);
        var eles = [];
        this.each(function () {
            var self = this;
            var instance = new Chart(self, options);
            eles.push(instance);
        });
        return eles[0];
    };

    $.fn.extend({
        'orangeChart': chart
    });
})(jQuery, window, document);
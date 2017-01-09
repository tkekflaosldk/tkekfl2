var DariPattern = function(config) {
    'use strict';
    if (config === undefined || config === null) {
        config = {};
    }
    this.config = {
        patternType: (config.patternType) ? config.patternType : 'odd_even',
        getType: (config.getType) ? config.getType : 'date',
        getData: (config.getData) ? config.getData : new Date().format('yyyy-MM-dd'),
        templateId: (config.templateId) ? config.templateId : 'pattern-template',
        parentWrapperId: (config.parentWrapperId) ? config.parentWrapperId : 'pattern',
        wrapperId: (config.wrapperId) ? config.wrapperId : 'pattern-box',
        patternBoxWidth: (config.patternBoxWidth) ? config.patternBoxWidth : 34,
        patternWidthType: (config.patternWidthType) ? config.patternWidthType : 'dataCount'
    };
    this.patternSixRes = null;
};
DariPattern.prototype.autoScroll = function() {
    'use strict';
    var $wrapper = $('#' + this.config.wrapperId);
    $wrapper.parent('.box_area').animate({
        scrollLeft: $wrapper.width()
    }, 100);
}
;
DariPattern.prototype.render = function(res, context) {
    'use strict';
    var html, $patternElement = $('#' + context.config.wrapperId);
    if (!res.data || res.data.length === 0) {
        dataNotFoundHandlerForDiv(this.config.wrapperId, '패턴 데이터가 존재하지 않습니다.');
        return false;
    }
    html = new EJS({
        element: context.config.templateId
    }).render(res);
    if (context.config.patternWidthType == 'dlCount') {
        $patternElement.html(html);
        context.patternSixRes = res;
        $patternElement.css('width', $patternElement.find('dl').length * context.config.patternBoxWidth + 'px');
    } else {
        $patternElement.append(html);
        $patternElement.css('width', res.data.length * context.config.patternBoxWidth + 'px');
        context.analysisRender(res, context);
    }
    context.autoScroll();
    try {
        if (typeof parent.resizeFrame === 'function') {
            parent.resizeFrame();
        }
    } catch (e) {}
}
;
DariPattern.prototype.analysisRender = function(res, context) {
    'use strict';
    var totalCount = 0;
    var analysisArray = new Array();
    var i = 0
      , j = 0
      , idx = 0
      , key = '';
    var row, value;
    var p = 0
      , pMax = 0;
    var html = '';
    for (i in res.data) {
        row = res.data[i];
        value = row.value;
        idx = null;
        for (j = 0; j < analysisArray.length; j++) {
            if (analysisArray[j].value == value) {
                idx = j;
                break;
            }
        }
        if (idx == null) {
            idx = analysisArray.length;
            analysisArray[idx] = new Object({
                'value': value,
                'value_alias': row.value_alias,
                'value_count': 0,
                'value_max_count': 0
            });
        }
        if (row.count > analysisArray[idx].value_max_count) {
            analysisArray[idx].value_max_count = row.count;
        }
        if (p > 0 && row.count == 1) {
            p++;
            if (p > pMax) {
                pMax = p;
            }
        } else {
            p = 1;
        }
        analysisArray[idx].value_count += row.count;
        totalCount += row.count;
    }
    for (i in analysisArray) {
        key = analysisArray[i]['value'];
        analysisArray[key] = analysisArray[i];
    }
    switch (context.config.patternType) {
    case 'start_point':
        totalCount = (analysisArray['LEFT'].value_count + analysisArray['RIGHT'].value_count);
        html += context.getAnalysisStatHTML(analysisArray['LEFT'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['RIGHT'], totalCount);
        break;
    case 'line_count':
        totalCount = (analysisArray['3'].value_count + analysisArray['4'].value_count);
        html += context.getAnalysisStatHTML(analysisArray['3'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['4'], totalCount);
        break;
    case 'odd_even':
        totalCount = (analysisArray['ODD'].value_count + analysisArray['EVEN'].value_count);
        html += context.getAnalysisStatHTML(analysisArray['ODD'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['EVEN'], totalCount);
        break;
    case 'under_over':
        totalCount = (analysisArray['UNDER'].value_count + analysisArray['OVER'].value_count + analysisArray['X'].value_count);
        html += context.getAnalysisStatHTML(analysisArray['UNDER'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['OVER'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['X'], totalCount);
        break;
    case 'start_line':
        totalCount = (analysisArray['LEFT4ODD'].value_count + analysisArray['RIGHT3ODD'].value_count + analysisArray['LEFT3EVEN'].value_count + analysisArray['RIGHT4EVEN'].value_count);
        html += context.getAnalysisStatHTML(analysisArray['LEFT4ODD'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['RIGHT3ODD'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['LEFT3EVEN'], totalCount);
        html += context.getAnalysisStatHTML(analysisArray['RIGHT4EVEN'], totalCount);
        break;
    }
    if (context.config.patternType != 'start_line') {
        html += '<li class="etc">' + res.data.length + '번 꺽음(' + pMax + '퐁당)</li>';
    }
    $('#' + context.config.parentWrapperId).find('.info').html(html);
}
;
DariPattern.prototype.getAnalysisStatHTML = function(array, totalCount) {
    var html = '';
    if (array != null) {
        if (array.value == '3') {
            array.value = 'line3';
            array.value_alias = '3';
        } else if (array.value == '4') {
            array.value = 'line4';
            array.value_alias = '4';
        }
        array.per_value = Math.round((array.value_count / totalCount * 10000)) / 100;
        html = '<li class="' + array.value.toLowerCase() + '"><span class="ic">' + array.value_alias + '</span><p class="tx"><strong>' + array.value_count + '번</strong> (' + array.per_value + '%) ' + array.value_max_count + '연속</p></li>';
    }
    return html;
}
DariPattern.prototype.reset = function() {
    'use strict';
    var $wrapper = $('#' + this.config.wrapperId);
    if ($wrapper.length > 0) {
        $wrapper.empty();
    }
}
;
DariPattern.prototype.select = function() {
    'use strict';
    this.reset();
    statsAPI.dari.getPattern(this.config.patternType, this.config.getType, this.config.getData, this.render, this);
}
;
DariPattern.prototype.renderStat = function(res, context) {
    'use strict';
    var html, $patternElement = $('#' + context.config.wrapperId);
    if (!res.data || res.data.length === 0) {
        dataNotFoundHandlerForDiv(this.config.wrapperId, '패턴 데이터가 존재하지 않습니다.');
        return false;
    }
    html = new EJS({
        element: context.config.templateId
    }).render(res);
    $patternElement.append(html);
    context.autoScroll();
    if (typeof parent.resizeFrame === 'function') {
        parent.resizeFrame();
    }
}
DariPattern.prototype.selectStat = function() {
    'use strict';
    this.reset();
    statsAPI.dari.getPatternStat(this.config.patternType, this.config.getType, this.config.getData, this.renderStat, this);
}
;




(function(global) {
    'use strict';
    var root = global
      , api = {}
      , apiUrl = '/stats/api.php';
    function _request(_data_, _method_, _type_, callback, context) {
        if (_method_ === undefined) {
            _method_ = 'POST';
        }
        if (_type_ === undefined) {
            _type_ = 'json';
        }
        $.ajax({
            url: apiUrl,
            method: _method_,
            dataType: _type_,
            data: _data_,
            success: function(res) {
                if (typeof callback === 'function') {
                    if (context !== undefined) {
                        callback(res, context);
                    } else {
                        callback(res);
                    }
                }
            }
        })
    }
    api.ladder = {};
    api.ladder = (function() {
        var getAnalysis = function(type, data, callback) {
            var sendData;
            if (!type || !data) {
                return null;
            }
            sendData = {
                type: 'ladder',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: type,
                analysis_data: data
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getEachMinMax = function(getValue, callback) {
            var sendData;
            if (!getValue) {
                return null;
            }
            sendData = {
                type: 'ladder',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: 'each_max',
                analysis_data: getValue
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getPattern = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'ladder',
                c: 'pattern',
                m: 'get_pattern',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getPatternStat = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'ladder',
                c: 'pattern',
                m: 'get_pattern_stat',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getRoundData = function(type, value, callback) {
            var sendData;
            if (type === undefined || type === null) {
                type = 'round';
            }
            if (!type || !value) {
                return null;
            }
            sendData = {
                type: 'ladder',
                c: 'round',
                m: 'get_round_data',
                get_type: type,
                get_value: value
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultCountGroup = function(date, round, callback) {
            var sendData, group = 'round';
            if (!date) {
                return null;
            }
            sendData = {
                type: 'ladder',
                c: 'round',
                m: 'get_result_count_group',
                group_by: group,
                date_range: date,
                round_range: round
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultStreamGroup = function(date, round, group, mode, callback) {
            var sendData;
            if (group === undefined || group === null) {
                group = 'reg_date';
            }
            if (round === undefined || round === null) {
                round = '1,288';
            }
            if (mode === undefined || mode === null) {
                mode = 'odd_even';
            }
            if (!date) {
                return null;
            }
            sendData = {
                type: 'ladder',
                c: 'round',
                m: 'get_result_stream_group',
                date_range: date,
                round_range: round,
                group_by: group,
                mode: mode
            };
            _request(sendData, 'POST', 'json', callback);
        };
        return {
            getAnalysis: getAnalysis,
            getPattern: getPattern,
            getPatternStat: getPatternStat,
            getRoundData: getRoundData,
            getEachMinMax: getEachMinMax,
            getResultCountGroup: getResultCountGroup,
            getResultStreamGroup: getResultStreamGroup
        };
    }());
    api.dari = {};
    api.dari = (function() {
        var getAnalysis = function(type, data, callback) {
            var sendData;
            if (!type || !data) {
                return null;
            }
            sendData = {
                type: 'dari',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: type,
                analysis_data: data
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getEachMinMax = function(getValue, callback) {
            var sendData;
            if (!getValue) {
                return null;
            }
            sendData = {
                type: 'dari',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: 'each_max',
                analysis_data: getValue
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getPattern = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'dari',
                c: 'pattern',
                m: 'get_pattern',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getPatternStat = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'dari',
                c: 'pattern',
                m: 'get_pattern_stat',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getRoundData = function(type, value, callback) {
            var sendData;
            if (type === undefined || type === null) {
                type = 'round';
            }
            if (!type || !value) {
                return null;
            }
            sendData = {
                type: 'dari',
                c: 'round',
                m: 'get_round_data',
                get_type: type,
                get_value: value
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultCountGroup = function(date, round, callback) {
            var sendData, group = 'round';
            if (!date) {
                return null;
            }
            sendData = {
                type: 'dari',
                c: 'round',
                m: 'get_result_count_group',
                group_by: group,
                date_range: date,
                round_range: round
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultStreamGroup = function(date, round, group, mode, callback) {
            var sendData;
            if (group === undefined || group === null) {
                group = 'reg_date';
            }
            if (round === undefined || round === null) {
                round = '1,480';
            }
            if (mode === undefined || mode === null) {
                mode = 'odd_even';
            }
            if (!date) {
                return null;
            }
            sendData = {
                type: 'dari',
                c: 'round',
                m: 'get_result_stream_group',
                date_range: date,
                round_range: round,
                group_by: group,
                mode: mode
            };
            _request(sendData, 'POST', 'json', callback);
        };
        return {
            getAnalysis: getAnalysis,
            getPattern: getPattern,
            getPatternStat: getPatternStat,
            getRoundData: getRoundData,
            getEachMinMax: getEachMinMax,
            getResultCountGroup: getResultCountGroup,
            getResultStreamGroup: getResultStreamGroup
        };
    }());
    api.powerLadder = {};
    api.powerLadder = (function() {
        var getAnalysis = function(type, data, callback) {
            var sendData;
            if (!type || !data) {
                return null;
            }
            sendData = {
                type: 'power_ladder',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: type,
                analysis_data: data
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getEachMinMax = function(getValue, callback) {
            var sendData;
            if (!getValue) {
                return null;
            }
            sendData = {
                type: 'power_ladder',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: 'each_max',
                analysis_data: getValue
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getPattern = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'power_ladder',
                c: 'pattern',
                m: 'get_pattern',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getPatternStat = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'power_ladder',
                c: 'pattern',
                m: 'get_pattern_stat',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getRoundData = function(type, value, callback) {
            var sendData;
            if (type === undefined || type === null) {
                type = 'round';
            }
            if (!type || !value) {
                return null;
            }
            sendData = {
                type: 'power_ladder',
                c: 'round',
                m: 'get_round_data',
                get_type: type,
                get_value: value
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultCountGroup = function(date, round, callback) {
            var sendData, group = 'date_round';
            if (!date) {
                return null;
            }
            sendData = {
                type: 'power_ladder',
                c: 'round',
                m: 'get_result_count_group',
                group_by: group,
                date_range: date,
                round_range: round
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultStreamGroup = function(date, round, group, mode, callback) {
            var sendData;
            if (group === undefined || group === null) {
                group = 'reg_date';
            }
            if (round === undefined || round === null) {
                round = '1,480';
            }
            if (mode === undefined || mode === null) {
                mode = 'odd_even';
            }
            if (!date) {
                return null;
            }
            sendData = {
                type: 'power_ladder',
                c: 'round',
                m: 'get_result_stream_group',
                date_range: date,
                round_range: round,
                group_by: group,
                mode: mode
            };
            _request(sendData, 'POST', 'json', callback);
        };
        return {
            getAnalysis: getAnalysis,
            getPattern: getPattern,
            getPatternStat: getPatternStat,
            getRoundData: getRoundData,
            getEachMinMax: getEachMinMax,
            getResultCountGroup: getResultCountGroup,
            getResultStreamGroup: getResultStreamGroup
        };
    }());
    api.racing = {};
    api.racing = (function() {
        var getAnalysis = function(type, data, callback) {
            var sendData;
            if (!type || !data) {
                return null;
            }
            sendData = {
                type: 'racing',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: type,
                analysis_data: data
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getRoundData = function(type, value, callback) {
            var sendData;
            if (type === undefined || type === null) {
                type = 'round';
            }
            if (!type || !value) {
                return false;
            }
            sendData = {
                type: 'racing',
                c: 'round',
                m: 'get_round_data',
                get_type: type,
                get_value: value
            };
            _request(sendData, 'POST', 'json', callback);
        };
        return {
            getAnalysis: getAnalysis,
            getRoundData: getRoundData
        };
    }());
    api.powerball = {};
    api.powerball = (function() {
        var getAnalysis = function(type, data, callback) {
            var sendData;
            if (!type || !data) {
                return null;
            }
            sendData = {
                type: 'powerball',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: type,
                analysis_data: data
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getEachMinMax = function(getValue, callback) {
            var sendData;
            if (!getValue) {
                return null;
            }
            sendData = {
                type: 'powerball',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: 'each_max',
                analysis_data: getValue
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getPattern = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'powerball',
                c: 'pattern',
                m: 'get_pattern',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getPatternStat = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'powerball',
                c: 'pattern',
                m: 'get_pattern_stat',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getRoundData = function(type, value, callback) {
            var sendData;
            if (type === undefined || type === null) {
                type = 'round';
            }
            if (!type || !value) {
                return null;
            }
            sendData = {
                type: 'powerball',
                c: 'round',
                m: 'get_round_data',
                get_type: type,
                get_value: value
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultCountGroup = function(date, round, callback) {
            var sendData, group = 'date_round';
            if (!date) {
                return null;
            }
            sendData = {
                type: 'powerball',
                c: 'round',
                m: 'get_result_count_group',
                group_by: group,
                date_range: date,
                round_range: round
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultStreamGroup = function(date, round, group, mode, callback) {
            var sendData;
            if (group === undefined || group === null) {
                group = 'reg_date';
            }
            if (round === undefined || round === null) {
                round = '1,288';
            }
            if (mode === undefined || mode === null) {
                mode = 'date_round';
            }
            if (!date) {
                return null;
            }
            sendData = {
                type: 'powerball',
                c: 'round',
                m: 'get_result_stream_group',
                date_range: date,
                round_range: round,
                group_by: group,
                mode: mode
            };
            _request(sendData, 'POST', 'json', callback);
        };
        return {
            getAnalysis: getAnalysis,
            getPattern: getPattern,
            getPatternStat: getPatternStat,
            getRoundData: getRoundData,
            getEachMinMax: getEachMinMax,
            getResultCountGroup: getResultCountGroup,
            getResultStreamGroup: getResultStreamGroup
        };
    }());
    api.speedkino = {};
    api.speedkino = (function() {
        var getAnalysis = function(type, data, callback) {
            var sendData;
            if (!type || !data) {
                return null;
            }
            sendData = {
                type: 'speedkino',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: type,
                analysis_data: data
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getEachMinMax = function(getValue, callback) {
            var sendData;
            if (!getValue) {
                return null;
            }
            sendData = {
                type: 'speedkino',
                c: 'analysis',
                m: 'get_analysis',
                analysis_type: 'each_max',
                analysis_data: getValue
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getPattern = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'min_odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'speedkino',
                c: 'pattern',
                m: 'get_pattern',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getPatternStat = function(patternType, getType, getValue, callback, context) {
            var data;
            if (patternType === undefined || patternType === null) {
                patternType = 'min_odd_even';
            }
            if (!getType || !getValue) {
                return null;
            }
            data = {
                type: 'speedkino',
                c: 'pattern',
                m: 'get_pattern_stat',
                pattern_type: patternType,
                get_type: getType,
                get_value: getValue
            };
            _request(data, 'POST', 'json', callback, context);
        };
        var getRoundData = function(type, value, callback) {
            var sendData;
            if (type === undefined || type === null) {
                type = 'round';
            }
            if (!type || !value) {
                return null;
            }
            sendData = {
                type: 'speedkino',
                c: 'round',
                m: 'get_round_data',
                get_type: type,
                get_value: value
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultCountGroup = function(date, round, callback) {
            var sendData, group = 'date_round';
            if (!date) {
                return null;
            }
            sendData = {
                type: 'speedkino',
                c: 'round',
                m: 'get_result_count_group',
                group_by: group,
                date_range: date,
                round_range: round
            };
            _request(sendData, 'POST', 'json', callback);
        };
        var getResultStreamGroup = function(date, round, group, mode, callback) {
            var sendData;
            if (group === undefined || group === null) {
                group = 'reg_date';
            }
            if (round === undefined || round === null) {
                round = '1,288';
            }
            if (mode === undefined || mode === null) {
                mode = 'date_round';
            }
            if (!date) {
                return null;
            }
            sendData = {
                type: 'speedkino',
                c: 'round',
                m: 'get_result_stream_group',
                date_range: date,
                round_range: round,
                group_by: group,
                mode: mode
            };
            _request(sendData, 'POST', 'json', callback);
        };
        return {
            getAnalysis: getAnalysis,
            getPattern: getPattern,
            getPatternStat: getPatternStat,
            getRoundData: getRoundData,
            getEachMinMax: getEachMinMax,
            getResultCountGroup: getResultCountGroup,
            getResultStreamGroup: getResultStreamGroup
        };
    }());
    root.statsAPI = api;
}(window));

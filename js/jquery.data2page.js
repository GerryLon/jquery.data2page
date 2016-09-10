/**
 * 常用于将一个对象填充到表单中
 * @author wanjl
 * @date 2016/09/10
 */
;
(function(window, $, undefined) {

    var defaultOptions = {

        // selectors = {
        //     key1: '#def',
        //     key2: '.test',
        //     key3: '[name="username"]'
        // }
        selectors: {},

        // 默认为当前窗口
        // context: window,

        // 默认为当前窗口中的jQuery对象
        contextSelector: $,

        // 不直接填充, 而以data属性来设置
        // 需求源于IPQAM的ip输入框, 因为是4个输入框, 而返回的ip是一个字符串, 所以不能直接填充, 
        // 所以要先缓存在data-*中, 然后在回调中填充
        // forData = {
        //     ip: 'data-value'
        // }
        // node.setAttribute('data-ip', '192.168.xxx')
        // 暂时不作实现 TODO
        forData: {},

        // 选择多个的, 值应该是一个数组
        // 也可能是这样的值, 处理要灵活
        // sub_type:"11090007|11090008|11090009"
        // case 'checkbox':
        // 对于字符串和数组进行判断, 然后填充, 字符串要有分隔符设置
        // shim = [{
        //     checkboxnameAlsoKey: {
        //      // 这里的值应该来来自obj, 而不是自己写
        //      separator: ','
        //     }
        // }],
        shim: []
    };

    $.fn.extend({
        data2page: function(obj, options) {

            obj = obj || {};
            options = $.extend(true, {}, defaultOptions, options);

            var selectors = options.selectors,

                contextSelector = options.contextSelector,
                // 不直接填充, 而以data属性来设置
                // 需求源于IPQAM的ip输入框, 因为是4个输入框, 而返回的ip是一个字符串, 所以不能直接填充, 
                // 所以要先缓存在data-*中, 然后在回调中填充
                // forData = {
                //     ip: 'data-value'
                // }
                // node.setAttribute('data-ip', '192.168.xxx')
                // 暂时不作实现 TODO
                forData = options.forData,

                // 选择多个的, 值应该是一个数组
                // 也可能是这样的值, 处理要灵活
                // sub_type:"11090007|11090008|11090009"
                // case 'checkbox':
                // 对于字符串和数组进行判断, 然后填充, 字符串要有分隔符设置
                // shim = [{
                //     checkboxnameAlsoKey: {
                //      // 这里的值应该来来自obj, 而不是自己写
                //      separator: ','
                //     }
                // }],
                shim = options.shim;

            var valueShimType,
                valueShimSeparator,

                idx = -1,
                len = 0,
                tmpVal,

                node = null,
                nodeNameLower = '',
                nodeTypeLower = '',
                nodeList = null,

                // for <select>
                domOptions;

            // 初始化selectors
            // selectors = {
            //     key1: '#def',
            //     key2: '.test',
            //     key3: '[name="username"]'
            // }
            $.each(obj, function(key) {
                selectors[key] = selectors[key] || '[name="' + key + '"]';
            });

            return this.each(function(_, form) {

                $.each(obj, function(key, val) {
                    
                    nodeList = $(form).find(selectors[key]);

                    len = nodeList.length;

                    if (len === 0) {
                        return true; // continue
                    }

                    // nodeList是一个类数组
                    $.each(nodeList, function(_, node) {

                        // 这里的node是某个节点
                        // 对于一个 文本输入框而言, 只有一个
                        // 对于单选而言, 至少两个, 那么这里的node代表其中的一个
                        nodeNameLower = node.tagName.toLowerCase();

                        switch (nodeNameLower) {
                            case 'input':
                                nodeTypeLower = node.type.toLowerCase();
                                switch (nodeTypeLower) {
                                    case 'text':
                                    case 'password':
                                    case 'button':
                                    case 'hidden':
                                        node.value = val;
                                        break;

                                    case 'range':
                                    case 'number':
                                        tmpVal = +val;

                                        // 对0要做特殊处理, 不然会因为判断而忽略掉
                                        if (tmpVal === 0) {
                                            node.value = tmpVal;
                                        } else {
                                            node.value = tmpVal || '';
                                        }
                                        break;

                                    case 'radio':
                                        if (node.value === val) {
                                            node.checked = true;

                                            // 单选只能有一个被选中, 所以这里break, 避免浪费
                                            return false;
                                        }
                                        break;

                                        // 选择多个的, 值应该是一个数组 
                                        // 也可能是这样的值, 处理要灵活
                                        // sub_type:"11090007|11090008|11090009"
                                    case 'checkbox':
                                        $.each(shim, function(_, shimVal) {
                                            valueShimType = $.type((shimVal[key] || {}).separator);

                                            if (valueShimType === 'undefined') {
                                                return true;
                                            }

                                            if (valueShimType === 'string') {

                                                // default separator is '|' symbol
                                                valueShimSeparator = (shimVal[key] || {}).separator || '|';

                                                $.each(val.split(valueShimSeparator), function(_, sVal) {
                                                    if (node.value === sVal) {
                                                        node.checked = true;
                                                    }
                                                });

                                            } else if (valueShimType === 'array') {
                                                $.each(val, function(_, aVal) {

                                                    if (node.value === aVal) {
                                                        node.checked = true;
                                                    }
                                                });
                                            }
                                        });
                                        break;

                                    default:

                                        break;
                                }
                                break;

                            case 'textarea':
                                node.value = val;
                                break;

                                // <select name="age">
                                //     <option value="0">0-30</option>
                                //     <option value="1">31-60</option>
                                //     <option value="2">60-100</option>
                                // </select>
                            case 'select':
                                domOptions = node.options;

                                // 这里将select分为可以选择多个的和单个的, 比较好处理
                                if (!node.multiple) {
                                    $.each(domOptions, function(_, option) {
                                        if (option.value === val) {
                                            option.selected = true;
                                            return false;
                                        }
                                    });
                                } else {
                                    $.each(shim, function(_, shimVal) {

                                        valueShimType = $.type((shimVal[key] || {}).separator);

                                        if (valueShimType === 'undefined') {
                                            return true;
                                        }

                                        $.each(domOptions, function(_, option) {

                                            if (valueShimType === 'string') {

                                                // default separator is '|' symbol
                                                valueShimSeparator = (shimVal[key] || {}).separator || '|';

                                                $.each(val.split(valueShimSeparator), function(_, sVal) {
                                                    if (option.value === sVal) {
                                                        option.selected = true;
                                                    }
                                                });

                                            } else if (valueShimType === 'array') {
                                                $.each(val, function(_, aVal) {

                                                    if (node.value === aVal) {
                                                        node.checked = true;
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                                break;

                                // like <td>, <span> etc.
                            default:
                                node.textContent = val;
                                break;
                        }
                    });
                });
            });
        }
    });

}(window, jQuery));

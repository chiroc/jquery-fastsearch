/**
 * Client page text search and highlight.
 * @project: http://git.oschina.net/470597142/jquery-fast-search
 * @auth: Chiroc(470597142@qq.com)
 * @dependence jQuery
 * @param $
 */
(function ($) {
    $.fn.fastSearch = function (target, options) {
        var self = $(this),
            setting = {
                caseSensitive: false,
                color: '#000',
                background: '#FF9632',
                afterClear: function (self) {
                },
                beforeSearch: function (self, keyWords) {
                },
                afterSearch: function (self, keyWrods, result, count) {
                }
            },
            result = [],
            count = 0,
            flags = 'gi',
            style = '',
            ESC_CODE = 27;

        setting = $.extend(setting, options);
        style = ['color:', setting.color, ';background:', setting.background].join('');
        target = target || $('body');

        if (setting.caseSensitive) {
            flags = 'g';
        }

        self.on('keyup',function (e) {
            if (ESC_CODE === e.keyCode) {
                self.val('');
                _.clearHighlight();
                setting.afterClear(self);
            }
            _.search(self.val());
        }).parent().delegate(self, 'input paste', function () {
                _.search(self.val());
            });

        var _ = {
            search: function (keyWrods) {
                keyWrods = $.trim(keyWrods.replace(/[<>]+|<(\/?)([A-Za-z]+)([<>]*)>/g, ''));
                if(keyWrods === ''){
                    _.clearHighlight();
                    return;
                }
                setting.beforeSearch(self, keyWrods);

                result = target.filter(':contains("' + keyWrods + '")');
                count = result.length;
                _.clearHighlight();

                if (count) {
                    result.each(function () {
                        var thiz = $(this);
                        thiz.html(thiz.html().replace(new RegExp("(" + keyWrods + ")(?![^<]*>)", flags), '<span class="fastsearch" style="float: none;' + style + '">$1</span>'));
                    });
                } else {
                    _.clearHighlight();
                }

                setting.afterSearch(self, keyWrods, result, count);
            },
            clearHighlight: function () {
                $('span.fastsearch', target).each(function () {
                    var thiz = $(this);
                    thiz.replaceWith(thiz.text());
                });
            }
        }
    };

    $.expr[':'].contains = function (a, i, m) {
        return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };
})(jQuery);
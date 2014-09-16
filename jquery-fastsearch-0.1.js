/**
 * Client page text search and highlight.
 * @project: http://git.oschina.net/470597142/jquery-fastsearch
 * @auth: Chiroc(470597142@qq.com)
 * @dependence jQuery
 * @param $
 */
(function ($) {
    $.fn.fastSearch = function (target, options) {
        var self = $(this),
            setting = {
                autoToggle: true,
                caseSensitive: false,
                color: '#000',
                background: '#FF9632',
                afterClear: function (self) {
                    if(this.autoToggle){
                        target.show();
                    }
                },
                beforeSearch: function (self, keyWords) {
                    if(this.autoToggle){
                        target.hide();
                    }
                },
                afterSearch: function (self, keyWords, result, count) {
                    if(this.autoToggle){
                        result.show();
                    }
                }
            },
            result = [],
            count = 0,
            flags = 'gi',
            style = '',
            KEY_CODE_ESC = 27;

        setting = $.extend(setting, options);
        style = ['color:', setting.color, ';background:', setting.background].join('');
        target = target || $('body');

        if (setting.caseSensitive) {
            flags = 'g';
        }else{
            $.expr[':'].contains = function (a, i, m) {
                return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };
        }

        self.on('keyup',function (e) {
            if (KEY_CODE_ESC === e.keyCode) {
                self.val('');
                _.clearHighlight();
                setting.afterClear(self);
            }
            _.search(self.val());
        }).parent().delegate(self, 'input paste', function () {
                _.search(self.val());
            });

        var _ = {
            search: function (keyWords) {
                keyWords = $.trim(keyWords.replace(/[<>]+|<(\/?)([A-Za-z]+)([<>]*)>/g, ''));
                if (keyWords === '') {
                    _.clearHighlight();
                    setting.afterClear(self);
                    return;
                }
                setting.beforeSearch(self, keyWords);

                result = target.filter(':contains("' + keyWords + '")');
                count = result.length;
                _.clearHighlight();

                if (count) {
                    result.each(function () {
                        var thiz = $(this);
                        thiz.html(thiz.html().replace(new RegExp("(" + keyWords + ")(?![^<]*>)", flags), '<span class="fastsearch" style="float: none;' + style + '">$1</span>'));
                    });
                } else {
                    _.clearHighlight();
                }

                setting.afterSearch(self, keyWords, result, count);
            },
            clearHighlight: function () {
                $('span.fastsearch', target).each(function () {
                    var thiz = $(this);
                    thiz.replaceWith(thiz.text());
                });
            }
        }
    };
})(jQuery);
/**
 * Client page text search and highlight.
 * @project: http://git.oschina.net/470597142/jquery-fastsearch
 * @auth: Chiroc(470597142@qq.com)
 * @dependence jQuery
 * @usage:
 * var target = $('#scope').find('td'); //The target for searching.
 * //$('#demo-4') is input object.
 * $('#demo-4').fastSearch(target, {
 *      dynamic: false, //Search node every, used for dynamic node.
 *      autoToggle: true, //Toggle show/hide DOM node when searching.
 *      caseSensitive: true, //Case sensitive.
 *      color: 'white', //font color for results.
 *      background: '#00f' //background color for results.
 *      parent: true //when want to hide it's parent node when toggle
 *      afterClear: function (self) {
 *          // afterClear: event after clear search results.
 *      },
 *      beforeSearch: function (self, keyWords) {
 *         // beforeSearch: event before search started.
 *      },
 *      afterSearch: function (self, keyWords, result, count) {
 *         // afterSearch: event after search completed.
 *      }
 * });
 **/
(function ($) {
    $.fn.fastSearch = function (target, options) {
        var self = $(this),
            result = [],
            count = 0,
            flags = 'gi',
            style = '',
            KEY_CODE_ESC = 27,
            setting = {
                dynamic: false,
                parent: false,
                autoToggle: false,
                caseSensitive: false,
                color: '#000',
                background: '#FF9632',
                afterClear: function (self) {
                    if (this.autoToggle) {
                        this.parent ? target.parent().show() : target.show();
                    }
                },
                beforeSearch: function (self, keyWords) {
                    if (this.autoToggle) {
                        this.parent ? target.parent().hide() : target.hide();
                    }
                },
                afterSearch: function (self, keyWords, result, count) {
                    if (this.autoToggle) {
                        this.parent ? result.parent().show() : result.show();
                    }
                }
            };

        setting = $.extend(setting, options);
        style = ['color:', setting.color, ';background:', setting.background].join('');
        target = target || $('body');

        if (setting.caseSensitive) {
            flags = 'g';
        } else {
            $.expr[':'].contains_ext = function (a, i, m) {
                return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };
        }

        self.on('keyup',function (e) {
            if (KEY_CODE_ESC === e.keyCode) {
                self.val('');
                _.clearHighlight();
                setting.afterClear(self);
            }
            if (setting.dynamic) {
                _.refreshTarget();
            }
            _.search(self.val());
        }).parent().delegate(self, 'input paste', function () {
                if (setting.dynamic) {
                    _.refreshTarget();
                }
                _.search(self.val());
            });

        var _ = {
            /**
             * Reset searching target.
             */
            refreshTarget: function () {
                target = $(target.selector);
            },
            /**
             * Search engine.
             * @param keyWords
             */
            search: function (keyWords) {
                keyWords = $.trim(keyWords.replace(/[<>]+|<(\/?)([A-Za-z]+)([<>]*)>/g, ''));
                if (keyWords === '') {
                    _.clearHighlight();
                    setting.afterClear(self);
                    return;
                }
                setting.beforeSearch(self, keyWords);

                result = target.filter(':contains_ext("' + keyWords + '")').not('.ignore');
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
            /**
             * Clear highlight string.
             */
            clearHighlight: function () {
                $('span.fastsearch', target).each(function () {
                    var thiz = $(this);
                    thiz.replaceWith(thiz.text());
                });
            }
        };

        return {
            /**
             * Get search result objects.
             * @returns {Array}
             */
            getResult: function () {
                return result;
            },
            /**
             * Get objects for searching.
             * @returns {*|HTMLElement}
             */
            getTarget: function () {
                return target;
            },
            /**
             * Dynamic settings set.
             * @param options
             */
            setting: function(options){
                setting = $.extend(setting, options);
            }
        };
    };
})(jQuery);
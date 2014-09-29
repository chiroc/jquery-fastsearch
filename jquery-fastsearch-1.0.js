/**
 * Client page text search and highlight.
 * @project: http://git.oschina.net/470597142/jquery-fastsearch
 * @auth: Chiroc(470597142@qq.com)
 * @dependence jQuery
 * @usage:
 * var target = $('#scope').find('td'); //The target for searching.
 * //$('#txt') is input object.
 * $('#txt').fastSearch(target, {
 *      dynamic: false, //Used for dynamic node.
 *      parent: true //Whether to hide its parent node when toggle(show/hide) node.
 *      caseSensitive: true, //Case sensitive.
 *      autoSearch: true, //Set true,Searching text after input completed, otherwise(false) need to type enter key for searching.
 *      autoToggle: true, //Whether to toggle(show/hide) DOM node when searching.
 *      highlight: true, //Set highlight text or not.
 *      color: '#fff', //font color for results.
 *      background: '#00f' //background color for results.
 *      afterClear: function (self) {
 *          // afterClear: event after clear search results.
 *      },
 *      beforeSearch: function (self, keyWords) {
 *         // beforeSearch: event before search started.
 *      },
 *      afterSearch: function (self, keyWords, result) {
 *         // afterSearch: event after search completed.
 *      }
 * });
 **/
(function ($) {
    $.fn.fastSearch = function (target, options) {
        var self = $(this),
            result = [],
            inc = false,
            parent = target.parent(),
            selector = target.selector,
            flags = 'gi',
            replacement = '',
            searchedTxt = '',
            tick = null,
            KEY_CODE_ESC = 27,
            KEY_CODE_ENTER = 13,
            KEY_CODE_BACKSPACE = 8,
            KEY_CODE_DELETE = 64,
            threshold = 500,
            setting = {
                dynamic: false,
                parent: false,
                caseSensitive: false,
                autoSearch: true,
                autoToggle: true,
                highlight: true,
                color: '#fff',
                background: '#00f',
                /**
                 * Show target nodes after text highlight cleared.
                 * @param self
                 * @param include
                 */
                afterClear: function (self, include) {
                    if (this.autoToggle) {
                        if (!include) {
                            this.parent ? parent.show() : target.show();
                        }
                    }
                },
                /**
                 * Hide target nodes before search started.
                 * @param self
                 * @param keyWords
                 * @param include
                 */
                beforeSearch: function (self, keyWords, include) {
                    if (this.autoToggle) {
                        this.parent ? (include ? result.parent() : parent).hide() : (include ? result : target).hide();
                    }
                },
                /**
                 * Show search result nodes after search completed.
                 * @param self
                 * @param keyWords
                 * @param result
                 */
                afterSearch: function (self, keyWords, result) {
                    if (this.autoToggle) {
                        this.parent ? result.parent().show() : result.show();
                    }
                }
            }, _ = {
                /**
                 * Reset searching target when dynamic = true.
                 */
                refreshTarget: function () {
                    target = $(selector);
                    parent = target.parent();
                },
                /**
                 * Search engine.
                 * @param keyWords
                 */
                search: function (keyWords) {
                    inc = false;
                    keyWords = $.trim(keyWords.replace(/[<>]+|<(\/?)([A-Za-z]+)([<>]*)>|[\\`'"\[\]&]/g, ''));
                    if (searchedTxt !== keyWords) {
                        if (searchedTxt !== '') {
                            if (!setting.caseSensitive) {
                                inc = keyWords.toLowerCase().indexOf(searchedTxt.toLowerCase()) != -1;
                            } else {
                                inc = keyWords.indexOf(searchedTxt) != -1;
                            }
                        }

                        if (setting.highlight) {
                            _.clearHighlight();
                            setting.afterClear(self, inc);
                        }
                    }

                    if (keyWords === '') {
                        return;
                    }

                    setting.beforeSearch(self, keyWords, inc);

                    if (setting.dynamic) {
                        _.refreshTarget();
                    }

                    if (!setting.caseSensitive) {
                        result = (inc ? result : target).filter(':contains_ext("' + keyWords + '")').not('.ignore');
                    } else {
                        result = (inc ? result : target).filter(':contains("' + keyWords + '")').not('.ignore');
                    }

                    setting.afterSearch(self, keyWords, result);

                    if (setting.highlight) {
                        _.highlight(result, keyWords);
                    }

                    searchedTxt = keyWords;
                },
                /**
                 * Text highlight with color & background color.
                 * @param result
                 * @param keyWords
                 */
                highlight: function (result, keyWords) {
                    var thiz, regExp = new RegExp('(' + _.formatExp(keyWords) + ')(?![^<]*>)', flags);
                    result.each(function () {
                        thiz = $(this);
                        thiz.html(thiz.html().replace(regExp, replacement));
                    });
                },
                /**
                 * Format illegal string as regular expression string.
                 * Illegal char: .?+()|$*^
                 * @param s
                 * @returns {XML|string}
                 */
                formatExp: function (s) {
                    return s.replace(/\./g, '\\.').replace(/\?/g, '\\?').replace(/\+/g, '\\+').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\|/g, '\\|').replace(/\$/g, '\\$').replace(/\*/g, '\\*').replace(/\^/g, '\\^');
                },
                /**
                 * Clear highlight string.
                 */
                clearHighlight: function () {
                    $('.jfs', result).each(function () {
                        var thiz = $(this);
                        thiz.replaceWith(thiz.text());
                    });
                }
            };

        setting = $.extend(setting, options);
        replacement = '<span class="jfs" style="' + ['color:', setting.color, ';background-color:', setting.background].join('') + '">$1</span>';
        target = target || $('body');

        if (setting.caseSensitive) {
            flags = 'g';
        } else {
            $.expr[':'].contains_ext = function (a, i, m) {
                return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };
        }

        /**
         * Event binding: keydown/input
         */
        self.on('keydown',function (e) {
            var val = self.val();
            switch (e.keyCode) {
                case KEY_CODE_ESC:
                {
                    clearTimeout(tick);
                    searchedTxt = '';
                    self.val('');
                    _.clearHighlight();
                    setting.afterClear(self, false);
                }
                    break;

                case KEY_CODE_ENTER:
                {
                    clearTimeout(tick);
                    if (!setting.caseSensitive) {
                        if (searchedTxt.toLowerCase() === val.toLowerCase()) {
                            return;
                        }
                    } else {
                        if (searchedTxt === val) {
                            return;
                        }
                    }
                    _.search(val);
                }
                    break;

                case KEY_CODE_BACKSPACE:
                {
                    clearTimeout(tick);
                }
                    break;

                case KEY_CODE_DELETE:
                {
                    clearTimeout(tick);
                }
                    break;

                default :
                {
                    if (target.length > threshold && setting.highlight && setting.autoSearch) {
                        clearTimeout(tick);
                    }
                }
            }
        }).bind('input', function () {
                var val = self.val();
                if (val === '') {
                    searchedTxt = '';
                    _.clearHighlight();
                    setting.afterClear(self, false);
                    return;
                }
                if (!setting.autoSearch) {
                    return;
                }

                if (target.length > threshold && setting.highlight) {
                    tick = setTimeout(function () {
                        _.search(val);
                    }, 250);
                } else {
                    _.search(val);
                }
            });

        /**
         * Common APIs
         */
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
            setting: function (options) {
                setting = $.extend(setting, options);
            },
            /**
             * Manual search
             * @param keywords
             */
            search: _.search,
            /**
             * Clear keywords highlight
             */
            clear: _.clearHighlight
        };
    };
})(jQuery);
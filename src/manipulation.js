(function (arr) {
    arr.forEach(function (item) {
        ['append', 'prepend'].forEach(function(where){
            if (item.hasOwnProperty(where)) {
                return;
            }
            Object.defineProperty(item, where, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function prepend() {
                    var argArr = Array.prototype.slice.call(arguments),
                        docFrag = document.createDocumentFragment();

                    argArr.forEach(function (argItem) {
                        var isNode = argItem instanceof Node;
                        docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
                    });

                    if (where === 'prepend')
                        this.insertBefore(docFrag, this.firstChild);
                    else
                        this.appendChild(docFrag);
                }
            });
        });
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

var normalizeElements = function(s){
    var result = undefined;
    if (typeof s === "string") result = $.isSelector(s) ? $(s) : $.parseHTML(s);
    else if (s instanceof HTMLElement) result = [s];
    else if (isArrayLike(s)) result = s;
    return result;
};

$.fn.extend({
    append: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(elIndex, el){
            $.each(_elements, function(){
                if (el === this) return ;
                var child = elIndex === 0 ? this : this.cloneNode(true);
                $.script(child);
                if (child.tagName && child.tagName !== "SCRIPT") el.append(child);
            });
        })
    },

    appendTo: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(parIndex, parent){
                if (el === this) return ;
                parent.append(parIndex === 0 ? el : el.cloneNode(true));
            });
        })
    },

    prepend: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function (elIndex, el) {
            $.each(_elements, function(){
                if (el === this) return ;
                var child = elIndex === 0 ? this : this.cloneNode(true);
                $.script(child);
                if (child.tagName && child.tagName !== "SCRIPT") el.prepend(child);
            });
        })
    },

    prependTo: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(parIndex, parent){
                if (el === this) return ;
                $(parent).prepend(parIndex === 0 ? el : el.cloneNode(true));
            })
        })
    },

    insertBefore: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(elIndex){
                if (el === this) return ;
                var parent = this.parentNode;
                if (parent) {
                    parent.insertBefore(elIndex === 0 ? el : el.cloneNode(true), this);
                }
            });
        })
    },

    insertAfter: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(elIndex, element){
                if (el === this) return ;
                var parent = this.parentNode;
                if (parent) {
                    parent.insertBefore(elIndex === 0 ? el : el.cloneNode(true), element.nextSibling);
                }
            });
        });
    },

    after: function(html){
        return this.each(function(){
            var el = this;
            if (typeof html === "string") {
                el.insertAdjacentHTML('afterend', html);
            } else {
                $(html).insertAfter(el);
            }
        })
    },

    before: function(html){
        return this.each(function(){
            var el = this;
            if (typeof html === "string") {
                el.insertAdjacentHTML('beforebegin', html);
            } else {
                $(html).insertBefore(el);
            }
        });
    },

    clone: function(deep, withData){
        var res = [];
        if (not(deep)) {
            deep = false;
        }
        if (not(withData)) {
            withData = false;
        }
        this.each(function(){
            var el = this.cloneNode(deep);
            var $el = $(el);
            var data;
            if (withData && $.hasData(this)) {
                data = $(this).data();
                $.each(data, function(k, v){
                    $el.data(k, v);
                })
            }
            res.push(el);
        });
        return $.merge($(), res);
    },

    import: function(deep){
        var res = [];
        if (not(deep)) {
            deep = false;
        }
        this.each(function(){
            res.push(document.importNode(this, deep));
        });
        return $.merge($(), res);
    },

    adopt: function(){
        var res = [];
        this.each(function(){
            res.push(document.adoptNode(this));
        });
        return $.merge($(), res);
    },

    remove: function(selector){
        var i = 0, node, out, res = [];

        if (this.length === 0) {
            return ;
        }

        out = selector ? this.filter(function(el){
            return matches.call(el, selector);
        }) : this.items();

        for ( ; ( node = out[ i ] ) != null; i++ ) {
            if (node.parentNode) {
                res.push(node.parentNode.removeChild(node));
                $.removeData(node);
            }
        }

        return $.merge($(), res);
    }
});
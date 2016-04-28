'use strict';

var _ = require('underscore');
var IncrementalDOM = require('../../template/idom');
var template = require('../../template');
var utils = require('./utils');
var contentHandler = require('./contentHandler');

var reservedAttrs = [
    'name', // deprecated
    'animationName',
    'initialAnimation',
    'tagName',
    'enterTimeout',
    'leaveTimeout',
    'enterClass',
    'leaveClass',
    'activeClass'
];

function rootElementOpen(options) {
    IncrementalDOM.elementOpenStart(options.tagName);

    var attributes = _.omit(options, reservedAttrs);
    _.each(attributes, function (value, name) {
        IncrementalDOM.attr(name, value);
    });

    var el = IncrementalDOM.elementOpenEnd();

    if (el.__firstRender === undefined) {
        el.__firstRender = true;
    }

    return el;
}

function rootElementClose(attrs) {
    var el = IncrementalDOM.elementClose(attrs.tagName);
    el.__firstRender = false;
    return el;
}

function initRenderData(rootEl, attrs) {
    return {
        rootEl: rootEl,
        attrs: attrs,
        children: utils.toArray(rootEl.children),
        keyMap: _.clone(utils.getNodeData(rootEl).keyMap) || {},
        keysRendered: {},
        keysToShow: {},
        position: 0,
        firstRender: rootEl.__firstRender,
        applyAnimation: !rootEl.__firstRender || attrs.initialAnimation !== 'none'
    };
}

template.registerHelper('transition', function(options, renderContent) {
    if (options.name) {
        console.warn('Warning: `name` is deprecated attribute for transitionGroup, use `animationName` instead');
    }

    var rootEl = rootElementOpen(options);
    var renderData = initRenderData(rootEl, options);

    contentHandler.start(renderData);
    renderContent();
    contentHandler.stop(renderData);

    rootElementClose(options);
    contentHandler.doTransition(renderData);
});
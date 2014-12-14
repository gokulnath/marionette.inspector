define([
  'marionette',
  "text!templates/devTools/activity/layout.html",
  "util/Radio",
  'app/modules/Activity/models/ActivityNode',
  'app/modules/Activity/views/ActivityTree',
  'app/modules/Activity/views/ActivityInfo',
], function(Marionette, tpl, Radio, ActivityNode, ActivityTree, ActivityInfo) {

  return Marionette.LayoutView.extend({

    template: tpl,

    regions: {
      activityList: '[data-region="activity-list"]',
      activityInfo: '[data-region="activity-info"]',
    },

    attributes: {
      view: 'activity-layout'
    },

    activityCommands: {
      'show:info': 'showInfo'
    },

    activityCollectionEvents: {
      'add remove reset': 'onChangeActivityCollection'
    },

    className: 'app-tool',

    activityCollection: undefined,
    activityRoot: undefined,

    initialize: function(options) {
      options = options || {};
      this.activityCollection = options.activityCollection;

      activityTree = this.activityCollection.buildTreePruned(this._filterTreeNode);
      this.activityRoot = new ActivityNode(activityTree, { level: 0 });

      this.bindEntityEvents(this.activityCollection, this.activityCollectionEvents);
      Radio.connectCommands('activity', this.activityCommands, this);

      this.onChangeActivityCollection = _.debounce(this.onChangeActivityCollection, 50);
    },

    onChangeActivityCollection: function () {
      var activityTree = this.activityCollection.buildTreePruned(this._filterTreeNode);
      this.activityRoot.updateNodes(activityTree.nodes);
    },

    onRender: function() {
      this.getRegion('activityList').show(new ActivityTree({
        model: this.activityRoot
      }));

      this.activityRoot.collapse();
      this.activityRoot.expandPath('root');

    },

    showInfo: function(activityModel) {
      this.getRegion('activityInfo').show(new ActivityInfo({
        model: activityModel
      }));
    },

    // Note: 'this' is not bound
    _filterTreeNode: function (treeNode) {
      return treeNode.event && treeNode.event.get('listeners').length || treeNode.nodes.length;
    }
  });
});

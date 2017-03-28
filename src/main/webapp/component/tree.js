define(
  ['component/base',
   'treeview',
   'chroma',
   'qtip'],
  function(base) {
    'use strict';
    return base.mixin(Tree);
    function Tree() {

      // utility var for click handlers
      var inEvent = 0;

      this.defaultAttrs({
        'tree_clear'        : '.tree-clear',
        'tree_expand'       : '.tree-expand-all',
        'tree_collapse'     : '.tree-collapse-all',
      });

      /**
       * Standard flight.js method
       */
      this.after('initialize',function() {
        this.on('click',{
          'tree_clear'      : function(e,d) {
            $(e.target).closest('.panel').find('.tree').treeview('uncheckAll')
          },
          'tree_collapse'   : function(e,d) {
            $(e.target).closest('.panel').find('.tree').treeview('collapseAll',{silent:true})
          },
          'tree_expand'     : function(e,d) {
            $(e.target).closest('.panel').find('.tree').treeview('expandAll',{silent:true})
          }
        });
        this.on('nodeChecked',this.updateStudySelections);
        this.on('nodeUnchecked',this.updateStudySelections);
      });

      /**
       * tree search box keyup handler
       * @memberof Tree
       */
      this.filterTree = function(e,d) {
        var $input = $(e.target)
        var value  = $input.val();
        this.select('src_search_clear').toggle(Boolean(value));
        if(value.length > 3)
        {
          this.select('tree_primary').treeview('search', [ value , {
            ignoreCase: true,     // case insensitive
            exactMatch: false,    // like or equals
            revealResults: true,  // reveal matching nodes
          }]);
        }
      };

      /**
       * True if selection has attribution (is a study and not an empty node)
       */
      this.isStudy = function(node) {
        if(this.isLeaf(node) && !!node.isStudy)
          return true;
        return false;
      };

      /**
       * True if selection is leaf node (no child nodes)
       */
      this.isLeaf = function(node) {
        if(!!!node.nodes || node.nodes.length == 0)
          return true;
        return false;
      };

      /**
       * Auto-expands and scrolls primary datasource tree to clicked study selection.
       * This is useful when intending to deselect a study
       */
      this.showInList = function(e,d) {
        var that = this;
        var nodeid = $(e.target).data('nodeid');
        var panel   = $('#src-box-primary.src-box .panel-body');
        //var tree  = that.select('tree_primary');
        _.each($('.treeview'),function(tree) {
          _.each(tree.treeview('getChecked'),function(node) { tree.treeview('revealNode',node) });
        });
        var item   = $('li[data-nodeid='+nodeid+']');
        // Scroll to the top
        panel.scrollTop(panel.scrollTop() + item.position().top);
      };

      /**
       * Checks child nodes when parent is selected
       * h/t '@hwde' (https://github.com/hwde):
       * @see https://github.com/jonmiles/bootstrap-treeview/issues/107#issuecomment-227171380
       */
      this.updateNodeSelections = function(node,tree) {
        var parent = tree.treeview('getParent', node);
        if (parent !== tree)
        {
            var checked = 0;
            for(var i in parent.nodes)
            {
                if (parent.nodes[i].state.checked)
                {
                    checked++;
                }
            }
            if ((parent.nodes.length == checked) != parent.state.checked)
            {
                tree.treeview(parent.state.checked ? 'uncheckNode' : 'checkNode', [parent.nodeId, { silent: true }]);
            }
            this.updateNodeSelections(parent,tree);
        }
      };

      /**
       * Changes display of selected studies in "Study Selections" panel, also
       *   - updates sample count
       *   - retrieves and caches caselist and geneticprofile data for each selected study
       *   - removes deselected studies from cache
       */
      this.updateStudySelections = function(event, node) {
        var that = this;

        // update cache for just-unchecked items
        if(event.type == 'nodeUnchecked')
        {
          for(let list of ['caselists','geneprofiles'])
          {
            delete window.cbio[list][node.id];
          }
        }

        // traverse tree for leafnodes when parent is selected
        var tree = $(event.target).closest('.tree');
        inEvent++;
        if (node.nodes !== undefined)
        {
            for(var i in node.nodes)
            {
              tree.treeview('checkNode', node.nodes[i].nodeId);
            }
        }
        inEvent--;
        if (inEvent == 0)
        {
           this.updateNodeSelections(node,tree);
        }

        // get array of study selections
        var selectedStudies = _.chain(tree.treeview('getChecked'))
        .filter(function(o) {
          return that.isLeaf(o);
        }).value();

        var source = tree.closest('.src-box').data('source');
        this.trigger('request.ui.update-selected-studies',{});//{'selectedStudies':selectedStudies});
        this.trigger('request.data.update-selected-studies',{'selectedStudies':selectedStudies, 'source':source});

      }
    }
  }
);

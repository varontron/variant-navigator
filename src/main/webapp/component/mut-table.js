define(
  [ 'flight', 
     'jquery', 
     'lodash',
     'datatables', 
     'treeview',
     'component/mut-table'
  ],
  function(flight, $, _, dataTables, treeview, mutatonTable)
  {

    'use strict';
    return flight.component(mutationTable);

    function mutationTable()
    {
      
      this.defaultAttrs({
        'q_cancerTypes': 'CBIO getTypesOfCancer',
        'q_cancerStudies': 'CBIO getCancerStudies',
        'q_portalMeta': 'CBIOP portal meta',
        'mut_table' : '#mut-table',
        'cbio_panel': '#src-box-cbio .panel-body ul', 
      });
      
      this.after('initialize', function() {
        this.enrich();
      });
      
      this.tissue = [
'Adrenal Gland',
'Biliary Tract',
'Bladder/Urinary Tract',
'Blood',
'Bone',
'Bowel',
'Breast',
'Cervix',
'CNS/Brain',
'Esophagus/Stomach',
'Eye',
'Head and Neck',
'Kidney',
'Liver',
'Lung',
'Lymph',
'Other',
'Ovary',
'Pancreas',
'Peripheral Nervous System',
'Pleura',
'Prostate',
'Skin',
'Soft Tissue',
'Testis',
'Thymus',
'Thyroid',
'Uterus'
]
      
      this.getCancerTypeList = function() {
        var that = this;
        var list = [];
        $.ajax({
          type:'POST',
          data:$.extend($.ajaxSetup.data,{
            q: that.attr.q_cancerTypes
          }),
          success:function(data){
            var d = data.RESULTSET.ROWS[0].split("\n").slice(1).sort();
            for(var t in d)
            {
              if(d[t] != "")
              {
                var row = d[t].split("\t");
                var item = {'type_of_cancer_id':row[0],'name':row[1]}
                list.push(item);
              }
              return list;
            }
          }
        })
      };
      
      this.getCancerStudyList = function() {
        var that = this;
        var list = [];
        $.ajax({
          type:'POST',
          data:$.extend($.ajaxSetup.data,{
            q: that.attr.q_cancerStudies
          }),
          success:function(data){
            var d = data.RESULTSET.ROWS[0].split("\n").slice(1).sort();
            for(var t in d)
            {
              if(d[t] != "")
              {
                var row = d[t].split("\t");
                var item = {'cancer_study_id':row[0],
                            'name':row[1],
                            'description':row[2]};
                list.push(item);
                
              }
            }
            return list;
          }
        })
      };
      
      this.getMutations = function() {
        var that = this;
        var list = [];
        $.ajax({
          type:'POST',
          data:$.extend($.ajaxSetup.data,{
            q: that.attr.q_mutations
          }),
          success:function(data){
            var d = data.RESULTSET.ROWS[0].split("\n").slice(1).sort();
            for(var t in d)
            {
              if(d[t] != "")
              {
                var row = d[t].split("\t");
                var item = {};
                list.push(item);
                
              }
            }
            return list;
          }
        })
      };
      
      /**
       * @param q = qname
       * @param spec = array of column names to parse out of result
       */
      this.getDelimitedSelectionCriteria = function(q,spec) {
        var that = this;
        var promise = $.ajax({
          type:'POST',
          data:$.extend($.ajaxSetup.data,{
            q: q
          })
        });
        return $.when(promise)
        .then(function(data){
            var list = [];
            var d = data.RESULTSET.ROWS[0].split("\n").slice(1).sort();
            for(var t in d)
            {
              if(d[t] != "")
              {
                var row = d[t].split("\t");
                var item = {};
                for(var i=0;i<spec.length;i++)
                {
                  item[spec[i]] = row[i]; 
                }
                list.push(item);
              }
            }
            return list;
          }
        );
      }
      
      this.getPortalMetaJson = function(q) {
        var that = this;
        var promise = $.ajax({
          data:$.extend($.ajaxSetup.data,{
            q: q
          })
        });
        return $.when(promise)
        .then(function(data) {
          console.log(data);
          var d = JSON.parse(data.RESULTSET.ROWS[0]);
          return d;
        })
      };
      
      this.buildTable = function() {
        this.select('mut-table').dataTable({
          ajax: {
            url: $.ajaxSettings.url, 
            type: 'POST',
            data: function(d) {
              return $.extend({}, d, {
                qname: self.attr.q_queries, // "YADA queries",
                params: self.app,
                pz: "-1"
              });
            },
            dataSrc: "RESULTSET.ROWS",
            "lengthMenu": [ [ 5, 10, 25, 50, 75, -1],
                            [ 5, 10, 25, 50, 75, 'All']
                          ],
            dom: '<"top"f>t<"bottom-l"i><"bottom-c"p><"bottom-r"l>',
            language: {
              search: 'Filter:',
              searchPlaceholder: 'Enter any value...'
            },
            columnDefs: [],
            columns: []
          }
        });
      };
      
      /* function getTree
       * 
       * Lifted directly from cbioportal.org: dynamicQuery.js: function addMetaDataToPage
       * 
       */
      this.getTree = function(data) {
        var json = data;
        var oncotree = []
        
     // Construct oncotree
        var oncotree = {'tissue':{code:'tissue', studies:[], children:[], parent: false, desc_studies_count:0, tissue:''}};
        var parents = json.parent_type_of_cancers;
        // First add everything to the tree
        for (var tumortype in parents) {
          if (parents.hasOwnProperty(tumortype)) {
            oncotree[tumortype] = {code:tumortype, studies:[], children:[], parent: false, desc_studies_count: 0, tissue: false};
          }
        }
        // Link parents and insert initial tissue info
        for (var tumortype in oncotree) {
          if (oncotree.hasOwnProperty(tumortype) && tumortype !== 'tissue') {
            oncotree[tumortype].parent = oncotree[parents[tumortype]];
            oncotree[tumortype].parent.children.push(oncotree[tumortype]);
            if (parents[tumortype] === "tissue") {
              oncotree[tumortype].tissue = tumortype;
            }
          }
        }
        // Insert tissue information in a "union-find" type way
        for (var elt in oncotree) {
            if (oncotree.hasOwnProperty(elt) && elt !== 'tissue') {
                var to_modify = [];
                var currelt = oncotree[elt];
                while (!currelt.tissue && currelt.code !== 'tissue') {
                    to_modify.push(currelt);
                    currelt = currelt.parent;
                }
                for (var i=0; i<to_modify.length; i++) {
                    to_modify[i].tissue = currelt.tissue;
                }
            }
        }
        // Add studies to tree
        for (var study in json.cancer_studies) {
//          if (priority_study_ids.hasOwnProperty(study)) {
//              continue;
//          } else if (study !== 'all') { // don't re-add 'all'
            try {
              var code = json.cancer_studies[study].type_of_cancer.toLowerCase();
              var lineage = [];
              var currCode = code;
              while (currCode !== 'tissue') {
                lineage.push(currCode);
                currCode = oncotree[currCode].parent.code;
              }
              oncotree[code].studies.push({id:study, lineage:lineage});
              var node = oncotree[code];
              while (node) {
                node.desc_studies_count += 1;
                node = node.parent;
              }
            } catch (err) {
//              console.log("Unable to add study");
//              console.log(json.cancer_studies[study]);
            }
//          }
        }
//        _.map(data,function(i) {
//          tree.push({text:i.name,description:i.description,id:i.cancer_study_id});
//        });
//        return _.sortBy(tree,'text');

        // Sort all the children alphabetically
        for (var node in oncotree) {
          if (oncotree.hasOwnProperty(node)) {
              oncotree[node].children.sort(function(a,b) {
                  try {
                      return json.type_of_cancers[a.code].localeCompare(json.type_of_cancers[b.code]);
                  } catch(err) {
                      return a.code.localeCompare(b.code);
                  }
              });
              oncotree[node].studies.sort(function(a,b) {
                  return a.id.localeCompare(b.id);
              });
          }
        }
        
        var splitAndCapitalize = function(s) {
          return s.split("_").map(function(x) { return (x.length > 0 ? x[0].toUpperCase()+x.slice(1) : x);}).join(" ");
        };
        
        var truncateStudyName = function(n) {
          var maxLength = 80;
          if (n.length < maxLength) {
            return n;
          } else {
            var suffix = '';
            var suffixStart = n.lastIndexOf('(');
            if (suffixStart !== -1) {
              suffix = n.slice(suffixStart);
            }
            var ellipsis = '... ';
            return n.slice(0,maxLength-suffix.length-ellipsis.length)+ellipsis+suffix;
          }         
        };
        
        var currNode;
        var node_queue = [].concat(oncotree['tissue'].children);
        var tree = [];
        
        while (node_queue.length > 0) 
        {
          currNode = node_queue.shift();
          if (currNode.desc_studies_count > 0) 
          {
            var name = splitAndCapitalize(json.type_of_cancers[currNode.code] || currNode.code);
            var entry = {
              'id':currNode.code, 
              'parent':((currNode.parent && currNode.parent.code) || '#'), 
              'text':name,
              'li_attr':{name:name},
              'nodes':[]
            };
            
            if(currNode.parent && currNode.parent.code !== 'tissue')
            {
              var parent = _.find(tree,{id:currNode.parent.code});
              if(!!parent)
                parent.nodes.push(entry)
            }
            else
            {
              tree.push(entry);
            }
            
            
            
            
            var numSamplesInStudy;
            var samplePlurality;
            $.each(currNode.studies, function(ind, elt) {
                  name = truncateStudyName(splitAndCapitalize(json.cancer_studies[elt.id].name));
                  numSamplesInStudy = json.cancer_studies[elt.id].num_samples;
                  if (numSamplesInStudy == 1) 
                  {
                    samplePlurality = 'sample';
                  }
                  else if (numSamplesInStudy > 1) 
                  {
                    samplePlurality = 'samples';
                  }
                  else 
                  {
                    samplePlurality = '';
                    numSamplesInStudy = '';
                  }
                  entry.nodes.push({'id':elt.id, 
                    'parent':currNode.code, 
                    'text':name.concat('<span style="font-weight:normal;font-style:italic;"> '+ numSamplesInStudy + ' ' + samplePlurality + '</span>'),
                    'li_attr':{name: name, description:json.cancer_studies[elt.id].description}});
                  
//                  flat_jstree_data.push({'id':elt.id, 
//                    'parent':jstree_root_id,
//                    'text':name,
//                    'li_attr':{name: name, description:metaDataJson.cancer_studies[elt.id].description, search_terms: elt.lineage.join(" ")}});
            });
            node_queue = node_queue.concat(currNode.children);
          }
        }
        return tree;
      };
      
      
//      this.addNodeToTree = function(node, children) {
//        
//      };
      
      this.enrich = function() {
        var cancerTypes;
        var that = this;
        //$.when(this.getDelimitedSelectionCriteria(this.attr.q_cancerTypes, ['type_of_cancer_id','name']))
        //$.when(this.getDelimitedSelectionCriteria(this.attr.q_portalMeta, ['cancer_study_id','name','description']))
        $.when(this.getPortalMetaJson(this.attr.q_portalMeta))
        .then(function(data) { 
          $('#src-box-cbio .tree').treeview({data: that.getTree(data)});
        });
      }
    
      
    }
  }
);
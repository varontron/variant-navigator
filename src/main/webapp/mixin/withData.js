define(
  function(require) {
    return withData;
    function withData() {

      this.md5 = require('md5');

      this.qnames = {
        'q_cbio_cancerTypes'     : 'CBIO getTypesOfCancer',
        'q_cbio_cancerStudies'   : 'CBIO getCancerStudies',
        'q_cbio_geneticProfiles' : 'CBIO getGeneticProfiles',
        'q_cbio_mutationData'    : 'CBIO getMutationData',
        'q_cbio_caseLists'       : 'CBIO getCaseLists',
        'q_taxData_cbio'         : 'CBIOP portal meta',
        'q_taxData_vardb'        : 'VARDB varnav tree',
        'q_taxData_cosmic'       : 'TAX list'
      };

      /**
       * retrieves and stores cohort and gene profile data
       * for use in viz queries
       */
      this.updateCache_cbio = function(selectedStudies) {
        for(let node of selectedStudies) {
          if(!!!window.cbio.geneprofiles[node.id]
             && !!!window.cbio.caselists[node.id])
          {
              $.when(this.getMutTabData(this.qnames.q_cbio_caseLists, node.id),
                     this.getMutTabData(this.qnames.q_cbio_geneticProfiles, node.id))
               .then(function(r1,r2) {
                 window.cbio.caselists[node.id] = r1;
                 window.cbio.geneprofiles[node.id] = r2;
              });
          }
        };
      };

      /**
       * retrieves and stores cohort and gene profile data
       * for use in viz queries
       */
      this.updateCache_vardb = function(selectedStudies) {

      };

      /**
       * retrieves and stores cohort and gene profile data
       * for use in viz queries
       */
      this.updateCache_cosmic = function(selectedStudies) {

      };


      /**
       * transforms cbio result into treeview structure
       */
      this.makeTree_cbio = function(data) {
        var that = this;
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
          if (study !== 'all') // don't re-add 'all'
          {
            try
            {
              var code = json.cancer_studies[study].type_of_cancer.toLowerCase();
              var lineage = [];
              var currCode = code;
              while (currCode !== 'tissue')
              {
                //lineage.push(currCode);
                currCode = oncotree[currCode].parent.code;
              }
              oncotree[code].studies.push({id:study});//, lineage:lineage});
              var node = oncotree[code];
              while (node)
              {
                node.desc_studies_count += 1;
                node = node.parent;
              }
            }
            catch (err) { }
          }
        }

        // Sort all the children alphabetically
        for (var node in oncotree)
        {
          if (oncotree.hasOwnProperty(node))
          {
            oncotree[node].children.sort(function(a,b)
            {
              try
              {
                return json.type_of_cancers[a.code].localeCompare(json.type_of_cancers[b.code]);
              }
              catch(err)
              {
                return a.code.localeCompare(b.code);
              }
            });
            oncotree[node].studies.sort(function(a,b)
            {
              return a.id.localeCompare(b.id);
            });
          }
        }

        // utility function to format tissue and histology in tree
        var truncateStudyName = function(n)
        {
          var maxLength = 80;
          if (n.length < maxLength)
          {
            return n;
          }
          else
          {
            var suffix = '';
            var suffixStart = n.lastIndexOf('(');
            if (suffixStart !== -1)
            {
              suffix = n.slice(suffixStart);
            }
            var ellipsis = '... ';
            return n.slice(0,maxLength-suffix.length-ellipsis.length)+ellipsis+suffix;
          }
        };

        var currNode;
        var node_queue = [].concat(oncotree['tissue'].children);
        //var tree = [];

        // create cbio tree node
        var createEntry = function(currNode, parent, name)
        {
          let pLin, pVal, parentCode;
          if(!!parent)
          {
            parentCode = parent.code || parent.value;
            pVal       = parentCode;
            if(!!parent.lineage)
              pLin = parent.lineage;
            if(window.cbio.meta.parent_type_of_cancers[parentCode] != 'tissue')
              pVal = window.cbio.meta.type_of_cancers[parentCode].toLowerCase().replace(/\s/g,'_');
          }
          let value  = currNode.code||currNode.id;
          let lin    = !!pLin ? [pLin,pVal].join(':') : !!currNode.parent ? pVal : null;
          let linMd5 = that.md5(lin);
          let idMd5  = lin == null ? that.md5(value) : that.md5([lin,value].join(":"));
          var entry  = {
            'id': idMd5,
            'value':value,
            'parent':parentCode,
            'text':name,
            'lineage': lin,
            'lineage': linMd5,
            'li_attr':{name:name},
            'nodes':[]
          };
          return entry;
        }

        var unflatten = function(array,parent,tree) {
          tree = !!tree ? tree : [];

          while(array.length > 0)
          {
            var currNode = array.shift();
            if (currNode.desc_studies_count > 0)
            {
              var name = that.splitAndCapitalize(json.type_of_cancers[currNode.code] || currNode.code);
              var entry = createEntry(currNode, parent, name);
              if(!!currNode.studies && !!currNode.studies.length)
              {
                unflatten(currNode.studies, entry);
              }
              else if(!!currNode.children && !!currNode.children.length)
                unflatten(currNode.children, entry);
              tree.push(entry)
            }
            else if(!!json.cancer_studies[currNode.id] || !!json.cancer_studies[currNode.code]) // it's a study
            {
              var id = currNode.id || currNode.code;
              var name = truncateStudyName(that.splitAndCapitalize(json.cancer_studies[id].name));
              var entry = createEntry(currNode,parent,name);
              var numSamplesInStudy = json.cancer_studies[id].num_samples;
              var samplePlurality = 'sample'
              if (numSamplesInStudy > 1)
              {
                samplePlurality += 's';
              }
              else if(numSamplesInStudy < 1)
              {
                samplePlurality = '';
                numSamplesInStudy = '';
              }
              entry.text = name.concat('<span style="font-weight:normal;font-style:italic;"> '+ numSamplesInStudy + ' ' + samplePlurality + '</span>'),
              entry.li_attr.name = name;
              entry.li_attr.description = json.cancer_studies[id].description;
              entry['isStudy'] = true;
              entry['samples'] = numSamplesInStudy;
              //entry['lineageMD5'] = that.md5(entry.lineage);
              delete entry.nodes;
              tree.push(entry)
            }
          }

          if(!!!parent) //check false
            return tree;

          parent['nodes'] = tree;
          return parent;
        }

        var tree = unflatten(node_queue);
        return tree;
      };


      this.makeTree_cosmic = function(data) {
        //window.cosmic.raw = data;
        return this.makeTree_vardb(data);
      };

      /**
       * transforms vardb data into treeview structure
       */
      this.makeTree_vardb = function(data) {
        var that   = this;
        var keys   = ['PRIMARY_SITE','HISTOLOGY','HIST_SUBTYPE1','HIST_SUBTYPE2','HIST_SUBTYPE3','STUDY_NAME'];
        var stops  = ['','\"\"','NS'];
        var tissue = {'id':that.md5('tissue'),'value':'tissue','parent':'','text':'tissue','nodes':[]};
        data = !!data ? data.RESULTSET.ROWS : [];

        // create vardb node
        var createEntry = function(value,parentValue,name,parentLineage) {
          let pVal   = parentValue.toLowerCase();
          let lin    = !!parentLineage ? [parentLineage,pVal].join(':') : pVal == 'tissue' ? null : pVal;
          let linMd5 = that.md5(lin);
          let idMd5  = lin == null ? that.md5(value) : that.md5([lin,value].join(":"));
          let entry  = {
            'id':idMd5,
            'value':value,
            'parent':parentValue,
            'lineage': lin,
            'lineageMD5': linMd5,
            'text':name,
            'li_attr':{name:name}
          };
          return entry;
        };

//           sample row
//           { HIST_SUBTYPE3: 'NS',
//             HIST_SUBTYPE1: 'lobular_carcinoma',
//             HIST_SUBTYPE2: 'NS',
//             HISTOLOGY: 'carcinoma',
//             PRIMARY_SITE: 'breast'
//           }

        while(data.length > 0)
        {
          // key 1
          let currRow  = data.shift();
          let parent   = tissue;

          // iterate over keys
          for(let i=0;i<keys.length;i++)
          {
            let val   = currRow[keys[i]];
            if(!_.contains(stops,val))
            {
              let pVal  = parent.value;
              let pLin  = !!parent.lineage && pVal != 'tissue' ? parent.lineage : null;
              let name  = that.splitAndCapitalize(val);
              let entry = {};

              // does entry not yet exist in parent?
              let node = _.where(parent.nodes,{value:val})[0];
              if(!!!node)
              {
                entry = createEntry(val,pVal,name,pLin);
                // process studies
                if(keys[i] == 'STUDY_NAME' && !!name)
                {
                  let samplePlurality = 'sample';
                  let numSamplesInStudy = currRow.SAMPLE_COUNT;
                  if (numSamplesInStudy > 1)
                  {
                    samplePlurality += 's';
                  }
                  else if(numSamplesInStudy < 1)
                  {
                    samplePlurality = '';
                    numSamplesInStudy = '';
                  }
                  entry.text = parent.text+' ('+name+') <span style="font-weight:normal;font-style:italic;"> '+ numSamplesInStudy + ' ' + samplePlurality + '</span>';
                  entry['li_attr']['name'] = parent.text+' ('+name+')';
                  entry['isStudy'] = true;
                  entry['samples'] = numSamplesInStudy;
                }
                if(!!entry.text )
                {
                  if(!!!parent.nodes)
                    parent['nodes'] = [];
                  parent.nodes.push(entry);
                }
              }
              else
              {
                entry = node;
              }
              parent = entry;
            }
          }
        }
        return tissue.nodes;
      };
    }
});

define(
  [
     'component/base',
     'mixin/withDataUtils',
     'mixin/withData',
     'md5',
     'datatables',
     'tipTip',
     //'component/mut-table',
     'backbone',
     'text!lib/mutationMapper/mutationMapperTemplates.html',
     'cbio_util',
     'gridvar',
     'lib/mutationMapper/mutationMapper'
  ],
  function(base, withDataUtils, withData, md5, dataTables, tipTip, Backbone)
  {
    'use strict';
    return base.mixin(UI,withDataUtils,withData);
    function UI()
    {
      this.defaultAttrs({

        //
        'mut_table'         : '#mut-table',
        'src_search'        : '#src-search',
        'tree_primary'      : '#src-box-primary .tree',
        'tree_primary_ldr'  : '#src-box-primary .loader',
        'tree_vardb'        : '#src-box-vardb .tree',
        'tree_vardb_ldr'    : '#src-box-vardb .loader',
        //
        'study_list'        : '#study-list',
        'gene_list'         : '#gene-list',
        'study_list_hdr'    : '#study-list-hdr',
        'gene_list_hdr'     : '#gene-list-hdr',
        'study_list_smpl_cnt' : '#study-list-sample-count',
        'gene_list_count'   : '#gene-list-count',
        'viz_list'          : '#viz-list',
        //
        'gridvar'           : '#gridvar',
        'mutmap'            : '#mutmap',
        'study_name'        : '.study-name',
        'src_search_clear'  : '.src-search-clear',
        'viz_trigger'       : '#viz-trigger'
      });

      this.after('initialize', function() {
        this.on('keyup',{
          'src_search': this.filterTree      // search the cbio tree
        });
        this.on('focusout', {
          'gene_list' : this.updateGeneCount // update the gene list header
        });
        this.on('click',{
          'study_name'      : this.showInList,     // scroll the cbio tree to the study
          'src_search_clear': this.clearSearch,    // clear the search box
          'viz_trigger'     : this.initViz         // execute the viz ajax
        });
        this.on('request.ui.update-selected-studies', this.updateStudySelectionsDisplay);
        this.on('request.data.update-selected-studies', this.updateStudySelectionsCache);
        this.on('')
        this.enrich();
      });

      /**
       *
       */
      this.updateStudySelectionsDisplay = function(e,d) {

        var selectedStudies = [];
        $('.tree').each(function() {
          var selected = _.chain($(this).treeview('getChecked')).filter(function(o) {
            return !!!o.nodes;
          }).value();
          selectedStudies = selectedStudies.concat(selected);
        })
        // html to paste into "Selected Studies" panel
        var fmtStudies = _.chain(selectedStudies).map(function(o) {
          var a = /(.+)(\(.+\))/.exec(o.li_attr.name);
          if(!!a)
          {
            var studyName   = '<span class="study-name" data-nodeid="'+o.nodeId+'" title="Click to scroll to study in list">'+a[1]+'</span>';
            var studyAttrib = '<span class="study-attrib">'+a[2]+'</span>';
            return studyName + studyAttrib;
          }
          return '';
        })
        .value()
        .join('; ');

        // number of samples in selected studies
        var sampleCount = _.reduce(selectedStudies,function(sum,node) {
          var count = parseInt(node.samples);
          return sum + (count != 'NaN' && count > 0 ? count : 0);
        },0);


        // update display of "Study Selection" panel
        this.select('study_list').html(fmtStudies);
        this.select('study_list_smpl_cnt').html("(" + sampleCount + " sample" + (sampleCount == 1 ? "" : "s") + ")");

        /* cbio genetic profile:
        genetic_profile_id: a unique ID used to identify the genetic profile ID in subsequent interface calls. This is a human readable ID. For example, "gbm_mutations" identifies the TCGA GBM mutation genetic profile.
        genetic_profile_name: short profile name.
        genetic_profile_description: short profile description.
        cancer_study_id: cancer study ID tied to this genetic profile. Will match the input cancer_study_id.
        genetic_alteration_type: indicates the profile type. Will be one of:
        MUTATION
        MUTATION_EXTENDED
        COPY_NUMBER_ALTERATION
        MRNA_EXPRESSION
        METHYLATION
        show_profile_in_analysis_tab: a boolean flag used for internal purposes (you can safely ignore it).


        cbio case list:
        case_list_id: a unique ID used to identify the case list ID in subsequent interface calls. This is a human readable ID. For example, "gbm_all" identifies all cases profiles in the TCGA GBM study.
        case_list_name: short name for the case list.
        case_list_description: short description of the case list.
        cancer_study_id: cancer study ID tied to this genetic profile. Will match the input cancer_study_id.
        case_ids: space delimited list of all case IDs that make up this case list.
        */
      };

      /**
       * Update the Gene List header to inform of the number of genes
       */
      this.updateGeneCount = function(e,d) {
        var value = this.select('gene_list').val()
        var count = value.replace(/^\s+|\s+$/g,'').split(/\s+/).length;
        this.select('gene_list_count').html("(" + count + " gene" + (count == 1 ? "" : "s") + ")");
      };

      /**
       * clear search box
       */
      this.clearSearch = function(e,d) {
        var $btn   = $(e.target)
        var $input = $btn.closest('.form-group').find('input');
        $input.val('').focus();
        $btn.toggle(!!$input.val());
        $btn.closest('.tree').treeview('clearSearch');
      };



      /* placeholder
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
      */


      /**
       * Retrieves data for vizulations and initializes them
       */
      this.initViz = function(e,d) {
        var that = this;
        e.preventDefault();
        // extract *CNA and *mutation profile ids from selected studies
        var geneprofiles = _.chain([].concat.apply([],_.values(cbio.geneprofiles)))
            .filter(function(i){ return /^COPY_NUMBER_ALTERATION|MUTATION_EXTENDED$/.test(i.genetic_alteration_type); })
            .pluck('genetic_profile_id')
            .value()
            .join('+');
        // genelist
        var genes = this.select('gene_list').val().replace(/^\s+|\s+$/g,'').split(/\s+/).join('+');
        // promise
        var cbioData = $.ajax({
          dataType: 'text',
          data:$.extend($.ajaxSetup.data,{q: this.qnames.q_mutationData,p:[geneprofiles,genes].join(',')})});
        $.when(cbioData)
        .then(function(cbio){
          console.log(cbio);
          // trigger event here to init gridvar
          var d = that.conformCbioData(cbio);
          that.initGridvar(d);
          that.initMutMapper(d.rowOrder);
        });
      };

      /**
       * Prepare/transform the raw data for the gridvar
       */
      this.conformCbioData = function(raw) {
        /*
         * entrez_gene_id gene_symbol case_id         sequencing_center mutation_status   mutation_type     validation_status amino_acid_change functional_impact_score xvar_link                                           xvar_link_pdb xvar_link_msa                                                   chr start_position  end_position  reference_allele  variant_allele  reference_read_count_tumor  variant_read_count_tumor  reference_read_count_normal variant_read_count_normal genetic_profile_id
         * 2033           EP300       TCGA-GV-A3JX-01 broad.mit.edu     NA                Missense_Mutation NA                E1526D            L                       getma.org/?cm=var&var=hg19,22,41568628,G,C&fts=all  NA            getma.org/?cm=msa&ty=f&p=EP300_HUMAN&rb=1306&re=1612&var=E1526D 22  41568628        41568628      G                 C               26                          7                         NA                          NA                        blca_tcga_pub_mutations
         * 2033           EP300       TCGA-BT-A3PK-01 broad.mit.edu     NA                Missense_Mutation NA                C1164Y            M                       getma.org/?cm=var&var=hg19,22,41553402,G,A&fts=all  NA            getma.org/?cm=msa&ty=f&p=EP300_HUMAN&rb=1155&re=1196&var=C1164Y 22  41553402        41553402      G                 A               121                         30                        NA                          NA                        blca_tcga_pub_mutations
         */
        var rowOrder = [];
        var columnOrder = [];
        var mutations = [];
        var data = []

        for(let row of raw.split(/\n/))
        {
          if(!/^(#|entrez)/.test(row))
          {
            let spleet = row.split(/\t/);
            let gene   = spleet[1];
            let samp   = spleet[2];
            let mut    = [spleet[5]];
            let mutStat = [spleet[4]];
            let amino  = [spleet[7]];
            if(!!gene && !!samp)
            {
              rowOrder.push(gene);
              columnOrder.push(samp);
              mutations.push(mut);
              let d = [gene,samp,mut,mutStat,amino];
              data.push(d);
            }
          }
        }
        var config = {
                  rowOrder:_.uniq(rowOrder),
                  columnOrder:_.uniq(columnOrder),
                  mutations:_.uniq(_.flatten(mutations)),
                  data:data}
        var histoData = {};
        _.each(config.rowOrder,function(v,k) {
          histoData[v] = _.filter(rowOrder,function(i) { return i==v;}).length/rowOrder.length;
        });
        config.histogramMapping_data = histoData;
        return config;
      };

      /**
       * Exec gridvar viz
       */
      this.initGridvar = function(config) {
        var dataMapping = {
            data:config.data,
            dataIndex:{rowKey:0, columnKey:1, mutation:2, mutType:3, amino:4}
        }

        var colors = chroma.scale('Spectral').domain([1,0]).colors(config.mutations.length);
        var dataDisplayMappings_mappings = {};
        _.each(config.mutations,function(v,k) {
          dataDisplayMappings_mappings[v] = colors[k]
        });

        this.select('gridvar').gridVar({
          cellTip: function(cellData) {
            return ['Gene: <strong>',cellData[0],
                    '</strong></br>Sample: <strong>',cellData[1],
                    '</strong></br>Mutation Type: <strong>',cellData[2],
                    '</strong></br>Mutation Status: <strong>',cellData[3],
                    '</strong></br>Amino Acid Change: <strong>',cellData[4],
                    '</strong>'].join('');
          },
          rowOrder: config.rowOrder,
          columnOrder: config.columnOrder,
          dataMapping: dataMapping,
          dataDisplayMapping: [{
              dataType: 'mutation',
              mappings: dataDisplayMappings_mappings
          }],
          histogramMapping: {
              data: config.histogramMapping_data,
              label: 'Mut. Frequency'
          },
          rowLabelClicked: function(event, data) {
              alert(data + ' clicked!');
          }
        });
      };

      /**
       * Exec mutation mapper viz
       */
      this.initMutMapper = function(geneList) {
        var options = {
            el: this.attr.mutmap, // target element where the components will be rendered
            data: {
                geneList: geneList
            },
            proxy: {
              mutationProxy: {
                  options: {
                      servletName: 'http://www.cbioportal.org/getMutationData.json',
//////                      params: {
//////                          geneticProfiles: 'ov_tcga_pub_mutations',
//////                          caseSetId: 'ov_tcga_pub_3way_complete'
//////                      }
                  }
              },
              pfamProxy: {
                  options: {
                      servletName: 'http://www.cbioportal.org/getPfamSequence.json'
                  }
              },
              mutationAlignerProxy: {
                  options: {
                      servletName: 'http://www.cbioportal.org/getMutationAligner.json'
                  }
              },
              pdbProxy: {
                  options: {
                      servletName: 'http://www.cbioportal.org/get3dPdb.json',
                      subService: false,
                      listJoiner: ' ',
                  }
              }
          }
        };

        var mutationMapper = new MutationMapper(options);
        mutationMapper.init();
      };

      /**
       * bootstrap rich ui
       */
      this.enrich = function() {
        var that = this;
        var dataSrcs = [{name:'cosmic'}, //TODO put this in config
                        {name:'cbio',r:'RESTPassThruResponse'},
                        {name:'vardb',r:'RESTPassThruResponse'}];
        for(let src of dataSrcs)
        {
          // construct the trees
          this.on(src.name+'-tree-attached.renderer',function(e) {
            $.when(this.getTaxData(this.qnames['q_taxData_'+src.name],src.name,src.r))
            .then(function(data) {
              // construct the tree from the query result
              var tree = that['makeTree_'+src.name](data);
              // store the tree in global scope
              window[src.name].tree = tree;
              // clear the swirlies
              $('#src-box-'+src.name+' .loader').remove();
              // build the treeview controls
              $('#src-box-'+src.name+' .tree')
              .treeview({data: tree,
                         showCheckbox: true,
                         highlightSearchResults: true
                        });
            });
          });

          // render tree divs, which will trigger tree construction
          this.trigger('request.renderer',{
            'template':'tree',
            'selector':'#src-box-'+src.name,
            'parent'  :'#source-box',
            'tmplvars':{id:src.name,title:src.name.toUpperCase()},
            'event'   :src.name+'-tree-attached.renderer'
          });

        }
      };
    }
  }
);

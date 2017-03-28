require.config({
		waitSeconds: 0,
		baseUrl: '',
    paths: {
      hogan:        "https://cdnjs.cloudflare.com/ajax/libs/hogan.js/3.0.2/hogan",
    	bootstrap:    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min",
    	datatables:   "http://cdn.datatables.net/1.10.7/js/jquery.dataTables.min",
    	domReady:     "http://cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min",
    	flight:       "https://cdnjs.cloudflare.com/ajax/libs/flight/1.1.4/flight.min",
    	jquery:       "http://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min",
    	//lodash:		    "http://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.16.4/lodash.min",
    	d3:           "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3",
    	//jqueryui:     "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.0/jquery-ui.min",
    	jqueryui:     "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min",
    	underscore:   "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
    	backbone:     "https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min",
    	treeview:     "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-treeview/1.2.0/bootstrap-treeview.min",
    	//autocomplete: "https://cdnjs.cloudflare.com/ajax/libs/jquery.devbridge-autocomplete/1.2.21/jquery.autocomplete",
    	//Clipboard:    "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.10/clipboard",
    	text:         "https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min",
    	chroma:       "https://cdnjs.cloudflare.com/ajax/libs/chroma-js/1.2.1/chroma.min",
    	qtip:         "http://cdnjs.cloudflare.com/ajax/libs/qtip2/3.0.3/jquery.qtip.min",
    	tipTip:       "https://cdnjs.cloudflare.com/ajax/libs/jquery.tiptip/1.3/jquery.tipTip.minified",
    	gridvar:      "lib/gridvar/jquery.nibrGridVar",
    	cbio_util:    "lib/cbio/cbio-util",
			md5:          "https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.5.0/js/md5.min"
//    	mutationMapper: "lib/mutationMapper/mutationMapper"

    },
//    map: {
//      '*': {
//        'underscore': 'lodash'
//      }
//    },
    shim: {
    	bootstrap: { deps : ["jquery"] },
    	treeview:  { deps : ["jquery"] },
    	flight:    { deps : ["jquery"], exports: 'flight'},
    	templates: { deps : ["hogan"] },
    	//autocomplete:   { deps : ["jquery"], exports: 'autocomplete'},
//    	oncoprintjs: { deps: ["d3","jquery"], exports: 'oncoprintjs' },
    	//mutationMapper: { deps: ["backbone"]},
    	gridvar: { deps: ["d3","jquery","jqueryui","underscore"], exports: 'gridvar' },
    	backbone: { deps: ["jquery","underscore"], exports: 'Backbone' },
    	cbio_util: {}
    },
    packages: [
//               {
//     name: 'oncoprintjs',
//     location: 'lib/oncoprintjs',
//     main: 'lib/oncoprintjs'
//    },
//    {name: 'mutationMapper',
//     location: 'lib/mutationMapper',
//     main:'mutationMapper'
//    }
    ]
});

require(
[
'backbone'
],
function(Backbone) {
  window.Backbone = Backbone;
  require(['jquery','boot','text!./yada-admin/config.json','./yada-admin/mixin/withConfig'],
      function($,Boot,config,withConfig){
				if(!!!window.cosmic)
          window.cosmic = {meta:{}, geneprofiles:{}, caselists:{}};
        else
          $.extend(window.cosmic,{meta:{}, geneprofiles:{}, caselists:{}});

        if(!!!window.cbio)
          window.cbio = {meta:{}, geneprofiles:{}, caselists:{}};
        else
          $.extend(window.cbio,{meta:{}, geneprofiles:{}, caselists:{}});

        if(!!!window.vardb)
          window.vardb = {meta:{}, geneprofiles:{}, caselists:{}};
        else
          $.extend(window.vardb,{meta:{}, geneprofiles:{}, caselists:{}});

        window.YADAAdmin  = config;
        withConfig.call(Boot.prototype);
      	Boot.initialize();
      });
});

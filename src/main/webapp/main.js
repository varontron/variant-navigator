require.config({
		waitSeconds: 0,
		baseUrl: '',
    paths: {
    	bootstrap:    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min",
    	datatables:   "http://cdn.datatables.net/1.10.7/js/jquery.dataTables.min",
    	domReady:     "http://cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min",
    	flight:       "https://cdnjs.cloudflare.com/ajax/libs/flight/1.1.4/flight.min",
    	jquery:       "http://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min",
    	lodash:		    "http://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.9.0/lodash.min",
    	d3:           "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3",
    	jqueryui:     "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.0/jquery-ui.min",
    	underscore:   "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
    	treeview:     "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-treeview/1.2.0/bootstrap-treeview.min",
    	//autocomplete: "https://cdnjs.cloudflare.com/ajax/libs/jquery.devbridge-autocomplete/1.2.21/jquery.autocomplete",
    	//Clipboard:    "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.10/clipboard",
    	text:         "https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min"
    },
    map : {
    	
    },
    shim: { 	
    	bootstrap: { deps : ["jquery"] },
    	treeview:  { deps : ["jquery"] },
    	flight:    { deps : ["jquery"], exports: 'flight'},
    	//autocomplete:   { deps : ["jquery"], exports: 'autocomplete'},   
    	oncoprintjs: { deps: ["d3","jquery"], exports: 'oncoprintjs' },
    	mutationMapper: {},
    	gridvar: { deps: ["d3","jquery","jqueryui","underscore"], exports: 'gridvar' }
    	
    },
    packages: [{
     name: 'oncoprintjs',
     location: 'lib/oncoprintjs',
     main: 'lib/oncoprintjs'
    },
    {name: 'mutationMapper',
     location: 'lib/mutationMapper'
    }]
});

require(
[	  

],
function() {
  require(['jquery','boot','text!./yada-admin/config.json','./yada-admin/mixin/withConfig'],function($,Boot,config,withConfig){
    window.YADAAdmin  = config;
    withConfig.call(Boot.prototype);
  	Boot.initialize();
  });
});

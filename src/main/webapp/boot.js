define(
	
	function(require) {

		return { initialize: initialize };

		function initialize() {

			require(['jquery',
			         'domReady',
			         'bootstrap'
			         ], 
			         
		  function ($, domReady, bootstrap) {
				
				// set ajax defaults
				var appContext = (this.context() != "ROOT" ? this.context() + '/': '');
				var defaultUrl = '/' + appContext + 'yada.jsp';
				$.ajaxSetup({
					url: defaultUrl,
		      type: 'GET',
		      dataType: 'json',
		      data: { pz: -1 }
				});

				var nest = $('.nest');
				
				var mutationTable = require('component/mut-table');
        mutationTable.attachTo('.nest');

			});
		}
	}
);
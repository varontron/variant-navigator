define(
  function(require) {
    return withData;
    function withData() {

      /**
       * utility function to format tissue and histology in tree
       */
      this.splitAndCapitalize = function(s)
      {
        if(!!s)
        {
          return s.split("_").map(function(x)
          {
            return (x.length > 0 ? x[0].toUpperCase()+x.slice(1) : x);
          }).join(" ");
        }
        return s;
      };

      /**
       * retrieves taxonomy data from source and kicks off makeTree
       */
      this.getTaxData = function(qname,source,responseClass) {
        var that    = this;
        var dataExt = {q:qname};
        // add the 'r' url parameter (e.g., RESTPassThruResponse)
        if(!!responseClass)
          $.extend(dataExt, {r:responseClass});
        var promise = $.ajax({data:$.extend($.ajaxSetup.data,dataExt)});
        return $.when(promise)
          .then(function(data) {
            if(!!data)
              window[source].meta = data;
            return data;
        });
      };

      /**
       * Retrieves tab delimited mutation detail data and returns json
       */
      this.getMutTabData = function(qname,params,header) {
        // yada parameters
        var p = Array.isArray[params] ? params.join(",") : params;
        // yada request
        var a =  $.ajax({dataType:'text',data:$.extend($.ajaxSetup.data,{q:qname, p:p})});
        // return the promise
        return
        $.when(a)
        // parse the tab data into json
        .then(function(r) {
          var data = r.split("\n");
          var hdr  = !!!header ? data.shift().split("\t") : header;
          var res  = [];
          var row  = '';
          while(row = data.shift())
          {
            let obj = {};
            let splitrow = row.split("\t");
            for(let i=0;i<splitrow.length;i++)
            {
              obj[hdr[i]] = splitrow[i];
            }
            res.push(obj);
          }
          return res;
        });
      };

      /**
       * api for data update triggered by tree selection
       */
      this.updateStudySelectionsCache = function(e,d) {
        this['updateCache_'+d.source].call(this, d.selectedStudies);
      };
    }
});

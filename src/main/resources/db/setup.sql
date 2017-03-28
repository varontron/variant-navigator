-- CBio TGCA interface
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('CBIO','http://www.cbioportal.org/webservice.do?');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getTypesOfCancer','cmd=getTypesOfCancer','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getCancerStudies','cmd=getCancerStudies','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getGeneticProfiles','cmd=getGeneticProfiles&cancer_study_id=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getCaseLists','cmd=getCaseLists&cancer_study_id=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getProfileData','cmd=getProfileData&case_set_id=?v&genetic_profile_id=?v&gene_list=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getMutationData','cmd=getMutationData&genetic_profile_id=?v&gene_list=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getMutationData with case_set_id','cmd=getMutationData&genetic_profile_id=?v&case_set_id=?v&gene_list=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getClinicalData','cmd=getClinicalData&case_set_id=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getProteinArrayInfo','cmd=getProteinArrayInfo&cancer_study_id=?v&protein_array_type=?v&gene_list=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getProteinArrayData','cmd=getProteinArrayData&case_set_id=?v&array_info=?v','YADABOT','CBIO');

-- Internal VARDB
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('VARDB','http://yada.na.novartis.net/yada.jsp?c=false&pz=-1&q=VARDB%20');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('VARDB get gene summary','gene%20summary&p=?v','YADABOT','VARDB');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('VARDB varnav tree','varnav%20tree','YADABOT','VARDB');
INSERT into YADA_PARAM (id,target,name,rule,value) VALUES ('1','VARDB varnav tree','r',1,'RESTPassThruResponse');

-- Internal VERTICA
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('VERT','http://yada.na.novartis.net/yada.jsp?q=VERT+goflof+by+gene&c=false&f=html&pz=-1');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('VERT goflof by gene','&p=?v','YADABOT','VERT');

--Taxonomy
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('TAX','jdbcUrl=jdbc:sqlite:/apps/yada/tomcat/webapps/variant-navigator/YADA.db
username=YADA
password=yada
autoCommit=true
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-YADA
driverClassName=org.sqlite.JDBC');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('TAX list','select Site_Primary||':'||Site_Subtype1||':'||Site_Subtype2||':'||Site_Subtype3||':'||Histology||':'||Hist_Subtype1||':'||Hist_Subtype2||':'||Hist_Subtype3||':'||Site_Primary_COSMIC||':'||Site_Subtype1_COSMIC||':'||Site_Subtype2_COSMIC||':'||Site_Subtype3_COSMIC||':'||Histology_COSMIC||':'||Hist_Subtype1_COSMIC||':'||Hist_Subtype2_COSMIC||':'||Hist_Subtype3_COSMIC as lineage
from TAX_COSMIC_CLASS
where Site_Primary != ''NS''','YADABOT','TAX');

-- Privs
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('CBIO','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('VARDB','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('VERT','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('TAX','YADA','ADMIN');

--Cosmic
--sqlite> .separator ','
--sqlite> .import /Users/varonda1/Downloads/classification.csv TAX_COSMIC_CLASS

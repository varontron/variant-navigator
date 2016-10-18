-- CBio TGCA interface
INSERT INTO YADA_QUERY_CONF (APP,SOURCE) VALUES ('CBIO','http://www.cbioportal.org/webservice.do?');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getTypesOfCancer','cmd=getTypesOfCancer','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getCancerStudies','cmd=getCancerStudies','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getGeneticProfiles','cmd=getGeneticProfiles&cancer_study_id=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getCaseLists','cmd=getCaseLists&cancer_study_id=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getProfileData','cmd=getProfileData&case_set_id=?v&genetic_profile_id=?v&gene_list=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getMutationData','cmd=getMutationData&genetic_profile_id=?v&gene_list=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getMutationData with case_set_id','cmd=getMutationData&genetic_profile_id=?v&gene_list=?v&case_set_id=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getClinicalData','cmd=getClinicalData&case_set_id=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getProteinArrayInfo','cmd=getProteinArrayInfo&cancer_study_id=?v&protein_array_type=?v&gene_list=?v','YADABOT','CBIO');
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('CBIO getProteinArrayData','cmd=getProteinArrayData&case_set_id=?v&array_info=?v','YADABOT','CBIO');

-- Internal VARDB 
INSERT INTO YADA_QUERY_CONF (APP,SOURCE) VALUES ('VARDB','http://yada.na.novartis.net/yada.jsp?q=VARDB%20gene%20summary&c=false&f=html&pz=-1'); 
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('VARDB get gene summary','&p=?v','YADABOT','VARDB');


-- Internal VERTICA
INSERT INTO YADA_QUERY_CONF (APP,SOURCE) VALUES ('VERT','http://yada.na.novartis.net/yada.jsp?q=VERT+goflof+by+gene&c=false&f=html&pz=-1'); 
INSERT into YADA_QUERY (qname,query,created_by,app) VALUES ('VERT goflof by gene','&p=?v','YADABOT','VERT');

-- Privs
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('CBIO','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('VARDB','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('VERT','YADA','ADMIN');
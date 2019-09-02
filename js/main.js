require(['./conf/dev'], function(){
    require(['jquery','data/mscombo_data'], function($, MSComboData){
        $(document).ready(function(){
            console.log('Loaded');
            console.log(MSComboData.getDateRange());
        });
    });
});
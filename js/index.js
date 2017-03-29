$(document).ready(function () {
  console.log("index.js ran");

  $("#web, #software, #fun").hide();


  $(".webBtn").click(function () {

    $("#software, #fun").slideUp("slow");

    $("#web").slideToggle("slow");
  });
  
  $(".funBtn").click(function () {

    $("#web, #software").slideUp("slow");

    $("#fun").slideToggle("slow");
  });
  
  $(".softwareBtn").click(function () {

    $("#web, #fun").slideUp("slow");

    $("#software").slideToggle("slow");
  });
  
  $( function() {
    $( "#tabs" ).tabs();
  } );
});

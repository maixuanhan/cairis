/*  Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.

    Authors: Shamal Faily */

'use strict';

$("#architecturalPatternsClick").click(function () {
  createArchitecturalPatternsTable();
});

function createArchitecturalPatternsTable(){

  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/architectural_patterns",
    success: function (data) {
      window.activeTable = "ArchitecturalPatterns";
      setTableHeader();
      var theTable = $(".theTable");
      $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
      var textToInsert = [];
      var i = 0;

      $.each(data, function(key, item) {
        textToInsert[i++] = "<tr>";
        textToInsert[i++] = '<td class="deleteArchitecturalPatternButton"><i class="fa fa-minus" value="' + item.theName + '"></i></td>';
        textToInsert[i++] = '<td class="architecturalpattern-rows" name="theName">';
        textToInsert[i++] = item.theName;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theInterfacesDER">';
        textToInsert[i++] = item.theAttackSurfaceMetric[0];
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theChannelsDER">';
        textToInsert[i++] = item.theAttackSurfaceMetric[1];
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theUntrustedSurfaceDER">';
        textToInsert[i++] = item.theAttackSurfaceMetric[2];
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '</tr>';
      });

      theTable.append(textToInsert.join(''));
      theTable.css("visibility","visible");
      $.contextMenu('destroy',$('.requirement-rows'));
      $("#reqTable").find("tbody").removeClass();

      activeElement("reqTable");
      sortTableByRow(0);
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  })
}

$(document).on('click', "td.architecturalpattern-rows", function () {
  var apName = $(this).text();
  viewArchitecturalPattern(apName);
});

function viewArchitecturalPattern(apName) {
  activeElement("objectViewer");
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/architectural_patterns/name/" + apName.replace(" ", "%20"),
    success: function (data) {
      fillOptionMenu("fastTemplates/editArchitecturalPatternOptions.html", "#objectViewer", null, true, true, function () {
        $("#editArchitecturalPatternOptionsForm").validator();
        $("#UpdateArchitecturalPattern").text("Update");
        $.session.set("ArchitecturalPattern", JSON.stringify(data));
        $("#theName").val(data.theName);
        $("#theSynopsis").val(data.theSynopsis);
        $.each(data.theComponents,function(idx,component) {
          appendComponent(component);
        });

        $.each(data.theConnectors,function(idx,connector) {
          appendConnector(connector);
        });

      });
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
};

$(document).on("click", "#addNewArchitecturalPattern", function () {
  activeElement("objectViewer");
  fillOptionMenu("fastTemplates/editArchitecturalPatternOptions.html", "#objectViewer", null, true, true, function () {
    $("#editArchitecturalPatternOptionsForm").validator();
    $("#UpdateArchitecturalPattern").text("Create");
    $("#editArchitecturalPatternOptionsForm").addClass("new");
    $.session.set("ArchitecturalPattern", JSON.stringify(jQuery.extend(true, {},architecturalPatternDefault )));
  });
});

function appendComponent(component) {
    $("#theComponents").find("tbody").append('<tr><td class="deleteComponent"><i class="fa fa-minus"></i></td><td class="component-row">'+ component.theName +'</td><td>' + component.theDescription + '</td></tr>');
};

function appendConnector(connector) {
    $("#theConnectors").find("tbody").append('<tr><td class="deleteConnector"><i class="fa fa-minus"></i></td><td class="connector-row">'+ connector.theConnectorName + '</td><td>' + connector.theFromComponent +'</td><td>' + connector.theFromRole + '</td><td>' + connector.theFromInterface + '</td><td>' + connector.theToComponent + '</td><td>' + connector.theToInterface + '</td><td>' + connector.theToRole + '</td><td>' + connector.theAssetName + '</td><td>' + connector.theProtocol + '</td><td>' + connector.theAccessRight + '</td></tr>');
};

$(document).on('click', "td.component-row", function () {
  var ap = JSON.parse($.session.get("ArchitecturalPattern"));
  var componentName = $(this).text();
  $.each(ap.theComponents,function(idx,apc) {
    if (apc.theName == componentName) {
      $("#editArchitecturalPatternOptionsForm").hide();
      $("#editComponentDiv").show(function(com) {
        $("#theComponentName").val(apc.theName); 
        $("#theDescription").val(apc.theDescription); 
        $("#theInterfaces").find("tbody").empty();
        $("#theStructure").find("tbody").empty();
        $("#theRequirements").find("tbody").empty();
        $("#theGoals").find("tbody").empty();
        $("#theGoalAssociations").find("tbody").empty();
        $.each(apc.theInterfaces,function(idx,comint) {
          appendComponentInterface(comint);
        });
        $.each(apc.theStructure,function(idx,comstr) {
          appendComponentStructure(comstr);
        });
        $.each(apc.theRequirements,function(idx,comreq) {
          appendComponentRequirement(comreq);
        });
        $.each(apc.theGoals,function(idx,comgoal) {
          appendComponentGoal(comgoal);
        });
        $.each(apc.theGoalAssociations,function(idx,comga) {
          appendComponentGoalAssociation(comga);
        });
      });
    }
  });
});

mainContent.on('click','#addComponent',function() {
  var ap = JSON.parse($.session.get("ArchitecturalPattern"));
  $("#editArchitecturalPatternOptionsForm").hide();
  $("#editComponentDiv").show();
});

function connectorAssets() {
  var ap = JSON.parse($.session.get("ArchitecturalPattern"));
  var fromComponent = $("#theFromComponent").val();
  var toComponent = $("#theToComponent").val();
  var assetSet = new Set();
  $.each(ap.theComponents,function(idx,apc) {
    if ((apc.theName == fromComponent) || (apc.theName == toComponent)) {
      $.each(apc.theStructure,function(idx,cstr) {
        assetSet.add(cstr.theHeadAsset);
        assetSet.add(cstr.theTailAsset);
      });
    }
  });
  return assetSet;
}

mainContent.on('click', "td.connector-row", function () {
  var ap = JSON.parse($.session.get("ArchitecturalPattern"));
  var connectorName = $(this).text();
  $.each(ap.theConnectors, function(idx,conn) {
    if (connectorName == conn.theConnectorName) {
      $("#editArchitecturalPatternOptionsForm").hide();
      $("#editConnectorDiv").show(function() {
        $("#theConnectorName").val(connectorName); 

        $.ajax({
          type: "GET",
          dataType: "json",
          accept: "application/json",
          data: {
            session_id: String($.session.get('sessionID'))
          },
          crossDomain: true,
          url: serverIP + "/api/dimensions/table/protocol",
          success: function (protocols) {
            $("#theProtocol option").remove();
            $.each(protocols,function(idx,protocol) {
              $('#theProtocol').append($("<option></option>").attr("value",protocol).text(protocol));
            });
            $("#theProtocol").val(conn.theProtocol);
          },
          error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
          }
        });

        $.ajax({
          type: "GET",
          dataType: "json",
          accept: "application/json",
          data: {
            session_id: String($.session.get('sessionID'))
          },
          crossDomain: true,
          url: serverIP + "/api/dimensions/table/access_right",
          success: function (accessRights) {
            $("#theAccessRight option").remove();
            $.each(accessRights,function(idx,accessRight) {
              $('#theAccessRight').append($("<option></option>").attr("value",accessRight).text(accessRight));
            });
            $("#theAccessRight").val(conn.theAccessRight);
          },
          error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
          }
        });

        $("#theFromRole").val(conn.theFromRole); 
        $("#theToRole").val(conn.theToRole); 
        $("#theFromComponent option").remove();
        $("#theToComponent option").remove();
        $.each(ap.theComponents,function(idx,comp) {
          $('#theFromComponent').append($("<option></option>").attr("value",comp.theName).text(comp.theName));
          $('#theToComponent').append($("<option></option>").attr("value",comp.theName).text(comp.theName));
        });
        $('#theFromComponent').val(conn.theFromComponent);
        $('#theToComponent').val(conn.theToComponent);

        $("#theFromInterface option").remove();
        $("#theToInterface option").remove();
        $.each(ap.theComponents,function(idx,comp) {
           if (comp.theName == conn.theFromComponent) {
             $.each(comp.theInterfaces,function(idx,compInt) {
               $("#theFromInterface").append($("<option></option>").attr("value",compInt.theName).text(compInt.theName));
             });
             $("#theFromInterface").val(conn.theFromInterface); 
           }

           if (comp.theName == conn.theToComponent) {
             $.each(comp.theInterfaces,function(idx,compInt) {
               $("#theToInterface").append($("<option></option>").attr("value",compInt.theName).text(compInt.theName));
             });
             $("#theToInterface").val(conn.theToInterface); 
           }
        });
        refreshAssetBox(conn.theAssetName);

        $('#theFromComponent').trigger('change');
        $('#theToComponent').trigger('change');
      });
    }
  });
});

var mainContent = $("#objectViewer");
mainContent.on('change',"#theFromComponent", function() {
  refreshAssetBox();
  refreshInterfaceBox("#theFromInterface",$("#theFromComponent").val());
});

mainContent.on('change',"#theToComponent", function() {
  refreshAssetBox();
  refreshInterfaceBox("#theToInterface",$("#theToComponent").val());
});

function refreshAssetBox(currentAsset) {
  if (currentAsset == undefined) {
    currentAsset = $("#theAssetName").val();
  }
  $("#theAssetName option").remove();
  var assets = connectorAssets();
  for (let cAsset of assets) {
    $('#theAssetName').append($("<option></option>").attr("value",cAsset).text(cAsset));
  }
  if (assets.has(currentAsset)) {
    $("#theAssetName").val(currentAsset);
  }
};

function refreshInterfaceBox(intCtrlId,cName) {
  var currentInterface = $(intCtrlId).val();
  $(intCtrlId + " option").remove();
  var ap = JSON.parse($.session.get("ArchitecturalPattern"));
  $.each(ap.theComponents,function(idx,apc) {
    if (apc.theName == cName) {
      $.each(apc.theInterfaces,function(idx,apcInt) {
        $(intCtrlId).append($("<option></option>").attr("value",apcInt.theName).text(apcInt.theName));
      });
      $(intCtrlId).val(currentInterface); 
    }
  });
}

function appendComponentInterface(comint) {
    $("#theInterfaces").find("tbody").append('<tr><td class="deleteComponentInterface"><i class="fa fa-minus"></i></td><td class="component-interface">'+ comint.theName +'</td><td>' + comint.theType + '</td><td>' + comint.theAccessRight + '</td><td>' + comint.thePrivilege + '</td></tr>');
};

function appendComponentStructure(comstr) {
    $("#theStructure").find("tbody").append('<tr><td class="deleteComponentStructure"><i class="fa fa-minus"></i></td><td class="component-structure">'+ comstr.theHeadAsset +'</td><td>' + comstr.theHeadAdornment + '</td><td>' + comstr.theHeadNav + '</td><td>' + comstr.theHeadNry + '</td><td>' + comstr.theHeadRole + '</td><td>' + comstr.theTailRole + '</td><td>' + comstr.theTailNry + '</td><td>' + comstr.theTailNav + '</td><td>' + comstr.theTailAdornment + '</td><td>' + comstr.theTailAsset + '</td></tr>');
};

function appendComponentRequirement(comreq) {
    $("#theRequirements").find("tbody").append('<tr><td class="deleteComponentInterface"><i class="fa fa-minus"></i></td><td class="component-requirement">'+ comreq + '</td></tr>');
};

function appendComponentGoal(comgoal) {
    $("#theGoals").find("tbody").append('<tr><td class="deleteComponentGoal"><i class="fa fa-minus"></i></td><td class="component-goal">'+ comgoal + '</td></tr>');
};

function appendComponentGoalAssociation(comga) {
    $("#theGoalAssociations").find("tbody").append('<tr><td class="deleteComponentGoalAssociation"><i class="fa fa-minus"></i></td><td class="component-goal">'+ comga.theGoalName + '</td><td>' + comga.theRefType + '</td><td>' + comga.theSubGoalName + '</td><td>' + comga.theRationale + '</td></tr>');
};


mainContent.on("click","#UpdateComponent",function() {
  $("#editComponentDiv").hide();
  $("#editArchitecturalPatternOptionsForm").show();
});

mainContent.on("click","#CloseComponent",function(e) {
  e.preventDefault();
  $("#editComponentDiv").hide();
  $("#editArchitecturalPatternOptionsForm").show();
});

mainContent.on("click","#UpdateConnector",function() {
  $("#editConnectorDiv").hide();
  $("#editArchitecturalPatternOptionsForm").show();
});

mainContent.on("click","#CloseConnector",function() {
  $("#editConnectorDiv").hide();
  $("#editArchitecturalPatternOptionsForm").show();
});

mainContent.on('click', '#CloseArchitecturalPattern', function (e) {
  e.preventDefault();
  createArchitecturalPatternsTable();
});




$(document).on('shown.bs.modal','#addComponentInterfaceDialog',function() {
  var selectedInt = $('#addComponentInterfaceDialog').attr('data-selectedInterface');
  if (selectedInt != undefined) {
    selectedInt = JSON.parse(selectedInt);
    $('#AddComponentInterface').text('Update');
    $('#theInterfaceName').val(selectedInt.theName);
    $('#theInterfaceType').val(selectedInt.theType);
  }
  else {
    $('#theInterfaceName').val('');
    $('#theInterfaceType').val('');
    $('#AddComponentInterface').text('Add');
  }

  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/dimensions/table/access_right",
    success: function (accessRights) {
      $("#theAccessRight option").remove();
      $.each(accessRights,function(idx,accessRight) {
        $('#theAccessRight').append($("<option></option>").attr("value",accessRight).text(accessRight));
      });
      if (selectedInt != undefined) {
        $('#theAccessRight').val(selectedInt.theAccessRight);
      }
      else {
        $('#theAccessRight').val('');
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });

  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/dimensions/table/privilege",
    success: function (privileges) {
      $("#thePrivilege option").remove();
      $.each(privileges,function(idx,privilege) {
        $('#thePrivilege').append($("<option></option>").attr("value",privilege).text(privilege));
      });
      if (selectedInt != undefined) {
        $('#thePrivilege').val(selectedInt.thePrivilege);
      }
      else {
        $('#thePrivilege').val('');
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
});

mainContent.on('click','#addComponentInterface',function() {
  $('#addComponentInterfaceDialog').removeAttr('data-selectedInterface');
  $('#addComponentInterfaceDialog').removeAttr('data-selectedIndex');
  $('#addComponentInterfaceDialog').modal('show');
});

mainContent.on('click','td.component-interface',function(){
  var intRow = $(this).closest("tr");
  var selectedInt = {};
  selectedInt.theName = intRow.find("td:eq(1)").text();
  selectedInt.theType = intRow.find("td:eq(2)").text();
  selectedInt.theAccessRight = intRow.find("td:eq(3)").text();
  selectedInt.thePrivilege = intRow.find("td:eq(4)").text();

  $('#addComponentInterfaceDialog').attr('data-selectedInterface',JSON.stringify(selectedInt));
  $('#addComponentInterfaceDialog').attr('data-selectedIndex',intRow.index());
  $('#addComponentInterfaceDialog').modal('show');
});

mainContent.on('click','#AddComponentInterface',function() {
  var selectedInt = {};
  selectedInt.theName = $('#theInterfaceName').val();
  selectedInt.theType = $('#theInterfaceType').val();
  selectedInt.theAccessRight = $('#theAccessRight').val();
  selectedInt.thePrivilege = $('#thePrivilege').val();
  
  var ap = JSON.parse($.session.get("ArchitecturalPattern"));
  var componentName = $('#theComponentName').val();
  $.each(ap.theComponents,function(idx,comp) {
    if (comp.theName == componentName) {
      var selectedIdx = $('#addComponentInterfaceDialog').attr('data-selectedIndex');
      if (selectedIdx != undefined) {
        comp.theInterfaces[selectedIdx] = selectedInt;
        $('#theInterfaces').find("tbody").find('tr:eq(' + selectedIdx + ')').find('td:eq(1)').text(selectedInt.theName);
        $('#theInterfaces').find("tbody").find('tr:eq(' + selectedIdx + ')').find('td:eq(2)').text(selectedInt.theType);
        $('#theInterfaces').find("tbody").find('tr:eq(' + selectedIdx + ')').find('td:eq(3)').text(selectedInt.theAccessRight);
        $('#theInterfaces').find("tbody").find('tr:eq(' + selectedIdx + ')').find('td:eq(4)').text(selectedInt.thePrivilege);
      }
      else {
        comp.theInterfaces.push(selectedInt);
        appendComponentInterface(selectedInt);
      }
      $('#addComponentInterfaceDialog').modal('hide');
    }
  });
});

mainContent.on('click','#addComponentStructure',function() {
  $('#addComponentStructureDialog').modal('show');
});

$(document).on('shown.bs.modal','#addComponentStructureDialog',function() {
  var selectedStr = undefined;
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/dimensions/table/template_asset",
    success: function (tailAssets) {
      $("#tailAsset option").remove();
      $.each(tailAssets,function(idx,tailAsset) {
        $('#tailAsset').append($("<option></option>").attr("value",tailAsset).text(tailAsset));
      });
      if (selectedStr != undefined) {
        $('#tailAsset').val(selectedStr.theTailAsset);
      }
      else {
        $('#tailAsset').val('');
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
});

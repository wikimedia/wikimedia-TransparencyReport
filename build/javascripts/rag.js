!function(e,t){function a(e,t){return"all"!==t?u[t]:"where_from"===e||"dmca_requests"===e?"JUL 2012 - JUN 2018":"JUL 2013 - JUN 2018"}var n=e.select("body").append("div").attr("class","graph_tooltip").style("display","none"),r={Afghanistan:"af",Argentina:"ar",Australia:"au",Austria:"at",Azerbaijan:"az",Bangladesh:"bd",Belgium:"be","Bosnia and Herzegovina":"ba",Brazil:"br",Bulgaria:"bg",Canada:"ca",Chile:"cl",China:"cn",Colombia:"co","Costa Rica":"cr",Croatia:"hr",Cyprus:"cy","Czech Republic":"cz",Denmark:"dk","Dominican Republic":"do",Ecuador:"ec",Egypt:"eg",Estonia:"ee",Finland:"fi",France:"fr",Georgia:"ge",Germany:"de",Greece:"gr",Guatemala:"gt",Honduras:"hn","Hong Kong":"hk",Hungary:"hu",India:"in",Indonesia:"id",Iran:"ir",Ireland:"ie",Israel:"il",Italy:"it",Japan:"jp",Korea:"kr",Kosovo:"xk",Latvia:"lv",Lebanon:"lb",Libya:"ly",Liechtenstein:"li",Lithuania:"lt",Luxembourg:"lu",Macedonia:"mk",Malaysia:"my",Malta:"mt",Mexico:"mx",Morocco:"ma",Nepal:"np",Netherlands:"nl","New Zealand":"nz",Nigeria:"ng",Norway:"no",Pakistan:"pk","Papua New Guinea":"pg",Peru:"pe",Philippines:"ph",Poland:"pl",Portugal:"pt","Puerto Rico":"pr",Romania:"ro",Russia:"ru","Saudi Arabia":"sa",Senegal:"sn",Serbia:"rs",Singapore:"sg",Slovakia:"sk",Slovenia:"si","South Africa":"za","South Korea":"kr",Spain:"es","Sri Lanka":"lk",Suriname:"sr",Sweden:"se",Switzerland:"ch",Taiwan:"tw",Tanzania:"tz",Thailand:"th",Turkey:"tr",Uganda:"ug",Ukraine:"ua","United Kingdom":"gb",Uruguay:"uy",USA:"us",Uzbekistan:"uz",Venezuela:"ve","United Arab Emirates":"ae",Guyana:"gy",Jordan:"jo",Kazakhstan:"kz",Kuwait:"kw"},u={juldec18:"Jul - Dec 2018",janjun18:"Jan - Jun 2018",juldec17:"Jul - Dec 2017",janjun17:"Jan - Jun 2017",juldec16:"Jul - Dec 2016",janjun16:"Jan - Jun 2016",juldec15:"Jul - Dec 2015",janjun15:"Jan - Jun 2015",juldec14:"Jul - Dec 2014",janjun14:"Jan - Jun 2014",juldec13:"Jul - Dec 2013",jul12jun13:"Jul 2012 - Jun 2013"};window.requestsAndGranted=function(u,i,s){function o(e,t){if("all"===t){var a={},n=[];return e.forEach(function(e){a[e.key]?(a[e.key].requests+=Number(e.requests),a[e.key].complied+=Number(e.complied)):(a[e.key]={},a[e.key].requests=Number(e.requests),a[e.key].complied=Number(e.complied))}),Object.keys(a).forEach(function(e){var t={key:e,requests:a[e].requests,complied:a[e].complied};n.push(t)}),n}return e.filter(function(e){return e.duration===t})}function l(a,u){function i(e,t){return N.filter(function(a){return a.key===e&&a.disclosed===t})[0]}var a=o(a,u);a.sort(function(e,t){var a=e.key.toLowerCase(),n=t.key.toLowerCase();return e.requests!==t.requests?t.requests-e.requests:a<n?-1:a>n?1:void 0});var s=a.map(function(e){return e.key}),l=s.indexOf("Unknown");if(l>-1){var c=a.splice(l,1);a.push(c[0])}var d=40*a.length+40;f.height(d),h.attr("height",d);for(var p=[],y=0;y<a.length;y++)p.push(y);var m=e.scale.ordinal().domain(a.map(function(e){return e.key})).range(p),k=e.scale.linear().domain([0,e.max(a,function(e){return Number(e.requests)})]).range([20,g]),x=(b.append("line").attr("class","left-line").attr("x1",0).attr("x2",0).attr("y1",20).attr("y2",d),b.selectAll("text.blue_bars").data(a,function(e){return e.key.split("*")[0]}));x.enter().append("text").attr("x","-100").style("opacity","0").attr("class","blue_bars"),x.text(function(e){var a="#t_";return a+=e.key.replace(/\W+/g," ").split(" ").join("_").toLowerCase(),0===t(a).size()&&console.log(a),t(a).val()}).on("mouseover",function(a){var r=Number(i(a.key,!0).value),u=Number(i(a.key,!1).value),s=t(e.event.target).offset().top+20,o=v+k(j[a.key])+50,l="<b>"+t("#t_total_requests").val()+"</b><span>"+(r+u)+"</span><b>"+t("#t_request_granted").val()+"</b><span>"+r+"</span>";return n.html(l).style("top",s+"px").style("left",o+"px").style("display","block")}).on("mouseout",function(){return n.style("display","none")}).on("click",function(e){""!==e.url&&"undefined"!=typeof e.url&&window.open("//"+e.url)}).classed("targeted",function(e){return""!==e.url&&"undefined"!=typeof e.url}).transition().style("opacity","1").attr("y",function(e,t){return 40*(t+1)}).attr("dy",-3).attr("x",5),x.exit().remove();var _=b.selectAll("image.flags").data(a,function(e){return e.key.split("*")[0]});_.enter().append("image").attr("class","flags").classed("flag",!0).each(function(e,t){"undefined"!=typeof r[e.key.split("*")[0]]&&b.append("rect").attr({"class":"flagBorder",width:"24",height:"18",y:function(){return 40*(t+1)-8},x:"-33"})}),_.attr("width",24).attr("height",18).attr("xlink:href",function(e){if("undefined"!=typeof r[e.key.split("*")[0]])return"./images/flags_svg/"+r[e.key.split("*")[0]]+".svg"}).on("mouseover",function(a){var r=Number(i(a.key,!0).value),u=Number(i(a.key,!1).value),s=t(e.event.target).offset().top+11,o=v+k(j[a.key])+50,l="<b>"+t("#t_total_requests").val()+"</b><span>"+(r+u)+"</span><b>"+t("#t_request_granted").val()+"</b><span>"+r+"</span>";return n.html(l).style("top",s+"px").style("left",o+"px").style("display","block")}).on("mouseout",function(){return n.style("display","none")}).transition().attr("y",function(e,t){return 40*(t+1)-8}).attr("x",-33),_.exit().remove();var N=[],j=[];a.forEach(function(e){j[e.key]=Number(e.requests),N.push({key:e.key,disclosed:!0,value:+e.complied,x:Number(e.requests)-Number(e.complied)}),N.push({key:e.key,disclosed:!1,value:Number(e.requests)-Number(e.complied),x:0})});var q=b.selectAll("rect.blue_bars").data(N,function(e){return e.key+e.disclosed});q.enter().append("rect").attr("class","blue_bars"),q.on("mouseover",function(a){var r=Number(i(a.key,!0).value),u=Number(i(a.key,!1).value),s=t(e.event.target).offset().top,o=v+k(j[a.key])+50,l="<b>"+t("#t_total_requests").val()+"</b><span>"+(r+u)+"</span><b>"+t("#t_request_granted").val()+"</b><span>"+r+"</span>";return n.html(l).style("top",s+"px").style("left",o+"px").style("display","block")}).on("mouseout",function(){return n.style("display","none")}).attr("height","12").attr("y",function(e){return 40*(m(e.key)+1)+3}).classed("disclosed",function(e){return e.disclosed}).transition().attr("x",function(e){return k(e.x)-20}).attr("width",function(e){return 0===e.value?0:k(e.value)}),q.exit().remove()}function c(e,t){var n=o(e,t),r=n.reduce(function(e,t){return e+Number(t.requests)},0),u=n.reduce(function(e,t){return e+Number(t.complied)},0),s=f.parent().siblings(".col-md-4");s.find(".scorecard--1 dd").text(r),s.find(".scorecard--2 dd").text(u),s.find(".scorecard--1 h2").text(a(i,t)),s.find(".scorecard--2 h2").text(a(i,t))}function d(){t(".flagBorder").remove(),[].slice.call(document.querySelectorAll("#"+i+"_graph .flags")).forEach(function(t){t.getAttribute("href")&&e.select("#"+i+"_graph svg g").append("rect").attr({"class":"flagBorder",width:"24",height:"18",y:function(){return t.getAttribute("y")},x:function(){return t.getAttribute("x")}})})}var p=s,f=t("#"+i+"_graph"),y={top:10,right:10,bottom:10,left:40},g=f.width()-y.left-y.right,m=f.height()-y.top-y.bottom,h=e.select("#"+i+"_graph").append("svg").attr("width",g+y.left+y.right).attr("height",m+y.top+y.bottom),b=h.append("g").attr("transform","translate("+y.left+","+y.top+")"),v=t(h[0]).offset().left;l(u,p),c(u,p),t("."+i+"_tabs").click(function(){t("."+i+"_tabs").removeClass("active"),t(this).addClass("active");var e=t(this).attr("id").split("_")[2];l(u,e),c(u,e),setTimeout(d,350)})}}(d3,jQuery);
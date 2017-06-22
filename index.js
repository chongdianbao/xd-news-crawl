/**
 * Created by 陈志勋 on 2017/6/18.
 */
var cheerio = require('cheerio');
var superagent = require('superagent');
var items = [];
var url = 'http://news.xidian.edu.cn/xwjh/jx.htm'
function getcontent(url,title) {
    superagent.get(url)
        .end(function (err,sres) {
            if(err) return err;
            var $ = cheerio.load(sres.text, {decodeEntities: false});
            var html = $('#wz_zw').text();
            //var file = toMarkdown(html);
            //console.log(html);
            var fs = require("fs") ;
            fs.writeFile(title+'.txt',html,function (err) {
                if(err)throw err;
                console.log('saved to markdown');
            })
        })
}
function getnews(url) {
    superagent.get(url)
        .end(function (err,sres) {
            if(err){
                return err;
            }
            var $ = cheerio.load(sres.text);
            $('.m-news-list .m-li-li').each(function (item) {
                var $item = $(this);
                var link = $item.find('a').attr('href');
                var title = $item.find('.pc-news-bt').text();
                items.push({
                    title: title,
                    href: link.replace("..","http://news.xidian.edu.cn")
                });
                console.log(title+' '+link);
            })
            var nextpage = $("a[class='Next']")
            console.log(nextpage.length);
            if(nextpage.length!=0){
                console.log(nextpage.attr('href'));
                if(nextpage.attr('href').search('jx')!=-1){
                    nexturl = 'http://news.xidian.edu.cn/xwjh/' + nextpage.attr('href');
                }
                else {
                    nexturl = 'http://news.xidian.edu.cn/xwjh/jx/' + nextpage.attr('href');
                }
                console.log(nexturl);
                getnews(nexturl);
            }
            else{
                console.log('finish');
                var fs = require("fs") ;
                fs.writeFile('result.json',JSON.stringify(items, null, 4),function (err) {
                    if(err)throw err;
                    console.log('saved');
                })
                for(var news in items){
                    console.log(items[news].href);
                    getcontent(items[news].href,items[news].title);
                }
            }
        })
}
function main() {
    console.log("开始爬取");
    getnews(url);
}
main(); //运行主函数
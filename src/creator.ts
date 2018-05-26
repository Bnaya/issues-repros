// can be also https://www.npmjs.com/package/source-map-support#cli-usage
import "source-map-support/register"
import mkdirp from "mkdirp";

mkdirp("./dir1/dir2/dir3", function(error) {
  if (error) {
    console.error(error);
  } else {
    console.log("Done");
  }
});

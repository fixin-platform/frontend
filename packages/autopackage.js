var fs = Npm.require("fs");
var path = Npm.require("path");

getDefaultProfiles = function() {
  return [
    {
      path: "lib/compatibility",
      architecture: ["client", "server"]
    },{
      path: "client/compatibility",
      architecture: ["client"],
      options: {bare: true}
    },{
      path: "server/compatibility",
      architecture: ["server"]
    },{
      path: "common/compatibility",
      architecture: ["client", "server"]
    },{
      path: "lib",
      architecture: ["client", "server"]
    },{
      path: "client/lib",
      architecture: ["client"]
    },{
      path: "server/lib",
      architecture: ["server"]
    },{
      path: "mixin",
      architecture: ["server"]
    },{
      path: "model",
      architecture: ["client", "server"],
      strategy: "clstree"
    },{
      path: "i18n",
      architecture: ["client", "server"]
    },{
      path: "client",
      architecture: ["client"]
    },{
      path: "server/model/Sequelize",
      architecture: ["server"],
      strategy: "clstree"
    },{
      path: "server/model",
      architecture: ["server"],
      strategy: "clstree"
    },{
      path: "server/binding",
      architecture: ["server"],
      strategy: "clstree"
    },{
      path: "server",
      architecture: ["server"]
    },{
      path: "common",
      architecture: ["client", "server"]
    },{
      path: "settings",
      architecture: ["server"],
      options: {isAsset: true}
    },{
      path: "sql",
      architecture: ["server"],
      options: {isAsset: true}
    },{
      path: "assets",
      architecture: ["server"],
      options: {isAsset: true}
    },{
      path: "public",
      architecture: ["client"],
      options: {isAsset: true}
    },{
      path: "private",
      architecture: [],
      options: {isAsset: true}
    },{
      path: "*", // Must be the last profile
      architecture: ["client", "server"]
    }
  ];
};

addFiles = function(api, packageName, profiles) {
  var buckets = {};
  fill(buckets, packageName, profiles);
  //console.log(packageName);
  //if (packageName === "umbrella") {
  //  console.log(buckets);
  //}
  for (var j = 0; j < profiles.length; j++) {
    //console.log(buckets[profiles[j].path], profiles[j].architecture, profiles[j].options);
    api.addFiles(buckets[profiles[j].path], profiles[j].architecture, profiles[j].options)
  }
};

fill = function(buckets, packageName, profiles) {
  var root = path.join(getMeteorRootDir(), "packages", packageName);
  var i, j, profile;
  for (j = 0; j < profiles.length; j++) {
    buckets[profiles[j].path] = [];
  }
  var files = getFiles(root, root), file;
  for (i = 0; i < files.length; i++) {
    file = files[i];
    for (j = 0; j < profiles.length; j++) {
      profile = profiles[j];
      if (file.indexOf(profile.path) === 0) {
        break;
      }
    }
    buckets[profile.path].push(file);
  }
  for (j = 0; j < profiles.length; j++) {
    profile = profiles[j];
    if (profile.strategy === "clstree") {
      buckets[profile.path].reverse();
    }
  }
};

var codeExtensions = [".js", ".coffee"];

getFiles = function(directory, root) {
  var entries = fs.readdirSync(directory),
      files = [],
      ownFiles = [];
  for (var i = 0; i < entries.length; i++) {
    var entryName = entries[i],
        entryPath = path.join(directory, entryName);
    if (entryName.indexOf(".") === 0 || entryName === "package.js") {
      continue;
    }
    if (fs.lstatSync(entryPath).isFile()) {
      var entryRelativePath = entryPath.replace(root + path.sep, "");
      if (codeExtensions.indexOf(path.extname(entryName)) !== -1) {
        ownFiles.push(entryRelativePath);
      } else {
        ownFiles.unshift(entryRelativePath);
      }
    } else {
      files = files.concat(getFiles(entryPath, root))
    }
  }
  files = files.concat(ownFiles);
  return files;
}

isAppDir = function(filepath) {
  try {
    return fs.statSync(path.join(filepath, ".meteor", "packages")).isFile();
  } catch (e) {
    return false;
  }
}

getMeteorRootDir = function() {
  var currentDir = process.cwd();
  while (currentDir) {
    var newDir = path.dirname(currentDir);
    if (isAppDir(currentDir)) {
      break;
    } else if (newDir === currentDir) {
      return null;
    } else {
      currentDir = newDir;
    }
  }
  return currentDir;
}

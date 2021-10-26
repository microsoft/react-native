// @ts-check
const fs = require("fs");
const path = require("path");
const semver = require('semver');

const pkgJsonPath = path.resolve(__dirname, "../package.json");
let publishBranchName = '';
try {
  publishBranchName = process.env.BUILD_SOURCEBRANCH.match(/refs\/heads\/(.*)/)[1];
} catch (error) {}

function gatherVersionInfo() {
    let pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    let releaseVersion = pkgJson.version;
    const branchVersionSuffix = (publishBranchName.match(/(fb.*merge)|(fabric)/) ? `-${publishBranchName}` : '');

    return {pkgJson, releaseVersion, branchVersionSuffix};
}

function updateVersionsInFiles(patchVersionPrefix) {

    let {pkgJson, releaseVersion, branchVersionSuffix} = gatherVersionInfo();

    const prerelease = semver.prerelease(releaseVersion);

    if (!prerelease) {
      if (patchVersionPrefix) {
        releaseVersion = semver.inc(releaseVersion, 'prerelease', patchVersionPrefix);
      }
      else {
      releaseVersion = semver.inc(releaseVersion, 'patch');
      }
    }

    if (prerelease) {
      releaseVersion = semver.inc(releaseVersion, 'prerelease');
      if (patchVersionPrefix) {
        releaseVersion = releaseVersion.replace(`-${prerelease[0]}.`, `-${prerelease[0]}-${patchVersionPrefix}.`);
      }
    }
 
    pkgJson.version = releaseVersion;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    console.log(`Updating package.json to version ${releaseVersion}`);
  
    return {releaseVersion, branchVersionSuffix};
}

function removePrivateFlag() {
  let {pkgJson} = gatherVersionInfo();
  delete pkgJson.private;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  console.log(`Updating package.json to NOT be marked private`);
}

function addPrivateFlag() {
  let {pkgJson} = gatherVersionInfo();
  pkgJson.private = true;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  console.log(`Updating package.json to be marked private`);
}

module.exports = {
    gatherVersionInfo,
    publishBranchName,
    pkgJsonPath,
    removePrivateFlag,
    addPrivateFlag,
    updateVersionsInFiles
}
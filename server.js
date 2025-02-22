require('dotenv').config();
const express = require('express');
const axios = require('axios');
const semver = require('semver');

const app = express();
const PORT = process.env.PORT || 2305;
app.use(express.json());

// Fetch package metadata from NPM
const fetchPackageMetadata = async (packageName) => {
    try {
        const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

// Fetch GitHub releases (changelog)
const fetchGitHubReleases = async (repoUrl) => {
    if (!repoUrl.includes("github.com")) return "Repository is not on GitHub.";
    
    try {
        const repoPath = repoUrl.replace("git+", "").replace(".git", "").replace("https://github.com/", "");
        const apiUrl = `https://api.github.com/repos/${repoPath}/releases?per_page=5`;
        const response = await axios.get(apiUrl);
        return response.data.map(release => ({
            tag: release.tag_name,
            title: release.name,
            body: release.body,
            url: release.html_url,
            date: release.published_at
        }));
    } catch (error) {
        return "Failed to fetch GitHub releases.";
    }
};

// Fetch GitHub compare URL for code diff
const fetchGitHubDiff = async (repoUrl, version1, version2) => {
    if (!repoUrl.includes("github.com")) return "Repository is not on GitHub.";
    
    try {
        const repoPath = repoUrl.replace("git+", "").replace(".git", "").replace("https://github.com/", "");
        return `https://github.com/${repoPath}/compare/${version1}...${version2}`;
    } catch (error) {
        return "Failed to fetch GitHub diff.";
    }
};

// Compare dependencies between two versions
const compareDependencies = (version1Deps, version2Deps) => {
    const changes = {
        added: [],
        removed: [],
        updated: []
    };

    Object.keys(version2Deps || {}).forEach(dep => {
        if (!version1Deps[dep]) {
            changes.added.push({ package: dep, version: version2Deps[dep] });
        } else if (version1Deps[dep] !== version2Deps[dep]) {
            changes.updated.push({ package: dep, from: version1Deps[dep], to: version2Deps[dep] });
        }
    });

    Object.keys(version1Deps || {}).forEach(dep => {
        if (!version2Deps[dep]) {
            changes.removed.push({ package: dep, version: version1Deps[dep] });
        }
    });

    return changes;
};

// API Route: Get package differences with full details
app.get('/diff', async (req, res) => {
    const { package, version1, version2 } = req.query;

    if (!package || !version1 || !version2) {
        return res.status(400).json({ error: 'Please provide package name, version1, and version2' });
    }

    if (semver.gt(version1, version2)) {
        return res.status(400).json({ error: 'version1 should not be greater than version2' });
    }

    const packageData = await fetchPackageMetadata(package);
    if (!packageData) {
        return res.status(404).json({ error: 'Package not found on NPM' });
    }

    const repository = packageData.repository ? packageData.repository.url : null;
    const githubReleases = repository ? await fetchGitHubReleases(repository) : "No repository found";
    const githubDiff = repository ? await fetchGitHubDiff(repository, version1, version2) : "No repository found";

    // Get dependencies for both versions
    const version1Data = packageData.versions[version1] || {};
    const version2Data = packageData.versions[version2] || {};
    const dependenciesDiff = compareDependencies(version1Data.dependencies || {}, version2Data.dependencies || {});

    res.json({
        package,
        version1,
        version2,
        repository,
        githubReleases,
        githubDiff,
        dependenciesDiff
    });
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT} | AB`));

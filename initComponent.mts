import { exec } from "child_process";
import { existsSync, readFileSync, rmSync } from "fs";
import simpleGit, { SimpleGit } from "simple-git";


class ComponentInit {

    protected gitRepository: SimpleGit;



    async init(path: string) {

        this.gitRepository = simpleGit(path, { binary: "git" });

        let gitUrl = await this.getSubmoduleValue("remote.origin.url");
        let username = await this.getSubmoduleValue("user.name");


        const packageFile = "package.json";
        if (!existsSync(packageFile)) throw new Error(`fail to find file ${packageFile}`)

        let packageData = readFileSync(packageFile).toString();
        let packageJson = JSON.parse(packageData);


        const componentPath = path.replace(/.+EAMD.ucp\//, '');

        let packerSplit = componentPath.split('/');
        const nameAndBranch = packerSplit.pop();
        const componentName = packerSplit.pop();
        const namespace = packerSplit.join(".");

        packageJson.name = componentName;
        packageJson.namespace = namespace;

        packageJson.author = username;

        packageJson.repository.url = 'git+' + gitUrl;
        if (gitUrl.match("github")) {
            packageJson.bugs.url = gitUrl + '/issues';
            packageJson.homepage = gitUrl + '#readme'
        }

        exec("npm uninstall -D simple-git");

        rmSync(import.meta.url);

    }

    private async getSubmoduleValue(key: string): Promise<string> {
        const rawResult = await this.gitRepository.raw(
            "config",
            "--file",
            ".gitmodules",
            "--get",
            key
        );
        return rawResult.replace(/\n$/, "");
    }
}

await new ComponentInit().init(process.cwd());
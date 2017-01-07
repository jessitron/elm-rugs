import {Project, File} from '@atomist/rug/model/Core'
import {ProjectEditor} from '@atomist/rug/operations/ProjectEditor'
import {Result,Status} from '@atomist/rug/operations/RugOperation'
import {PathExpressionEngine, PathExpression} from '@atomist/rug/tree/PathExpression'

interface Parameters {}

let editor: ProjectEditor = {
    tags: ["elm"],
    name: "Release",
    description: "Add a release script for publishing Elm on github pages",
    edit(project: Project, p: Parameters): Result {
      project.merge("release.vm", "release", {})
      return new Result(Status.Success, "License file added")
    }
}

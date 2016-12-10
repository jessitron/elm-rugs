import {Project, File} from '@atomist/rug/model/Core'
import {Parameters} from '@atomist/rug/operations/Parameters'
import {ProjectEditor} from '@atomist/rug/operations/ProjectEditor'
import {Result,Status} from '@atomist/rug/operations/Result'
import {PathExpressionEngine, PathExpression} from '@atomist/rug/tree/PathExpression'

import {parameter, inject, parameters, tag, editor} from '@atomist/rug/support/Metadata'

@editor("Add a release script for publishing Elm on github pages")
@tag("elm")
class Release implements ProjectEditor<Parameters> {

  private eng: PathExpressionEngine;

  constructor(@inject("PathExpressionEngine") _eng: PathExpressionEngine ){
    this.eng = _eng;
  }

  edit(project: Project, p: Parameters) {
    project.merge("release.vm", "release", {})
    return new Result(Status.Success, "License file added")
  }
}

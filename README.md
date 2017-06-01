## Natural Gas Coordination

Story, how-to guides, and case studies to help municipalities and gas utilities coordinate paving and street repair, to fix aging infrastructure and save money while doing it.

## Development
`bundle install`
`middleman serve`

## Deployment
`git push origin master`

Deployments are managed through Travis CI Webhooks. 

### Adding data and content

#### Categories

To add a new category, copy an existing category and replace the data, to make sure you have all the correct fields.

#### Action steps

Action steps are defined in two places: categories.yml, and in categories/content. To add an action step, add the name of the action step to the list of action steps in a category.

Action step content -- that is, the content revealed in each accordion item -- is defined in a Markdown file at `/source/categories/content/{category name}/{action step name}.md`.

The category name and action step name have both been "parameterized" and "underscored". For example, if your category is called "Prepare to shop" and your action step is "Check your credit", the file will be located at `/source/categories/content/prepare_to_shop/check_your_credit.md`.

The default setting is to render an error message in the accordion if there's no file. If you want it to raise an error, set the environment variable `RESCUE_MISSING_FILES=false`.

#### Story segments

The story segments, and their order, are defined in story.yml. Run `rake generate:story` to generate any missing story files into story/content.

# Elm Generators and Editors for Rug

OUT OF DATE

Unfortunately these don't work with the current version of Rug. I have to rewrite the elm-parsing infrastructure first.
This will probably happen in June 2017.

## Sorry


This repository contains scripts for starting and upgrading Elm programs. The scripts run in [Rug](http://docs.atomist.com/rug/why-and-what-is-rug/), a DSL and runtime for code that modifies code.

Here's a writeup of how to get started: [Using Rug with Elm](http://blog.jessitron.com/2016/12/using-rug-with-elm.html)

In general, there are two ways to run Rugs.
The Atomist bot in [Atomist Community Slack](https://join.atomist.com) can run the published versions. The bot will create a repo for you in response to `@atomist create`, or send a PR to an existing repo on `@atomist edit` (after you authorize it to do this in your github account). In the #rug-elm channel, type "@atomist create elm" to start.

To run locally (and change!) the latest versions of these Rugs, clone this repo and use the [Rug CLI](https://docs.atomist.com/quick-starts/rug-cli/).

Way Major Caveat!! I only know that these work on the particular code I've run them on. They're going to fail a lot. Issues welcome.

## Generators
Generators create a new project from scratch.

Sample usage, to create a project called `banana` as a subdirectory of the current directory:

`rug generate jessitron:elm-rugs:StaticPage banana`

### StaticPage
A new Elm program with a main function that returns an empty div. Start here to create your basic UI, and then add interactivity with UpgradeToBeginnerProgram.


## Editors
Editors operate on an existing project. They change the Elm code for you, in ways that you're likely to do often.

I'm only listing the top-level editors here. That are also small ones (like AddToModel or AddMessage) that are really units of composition for the bigger ones listed here.

Sample usage, to add a text input to an existing beginner program (run this in your Elm project's directory):

`rug edit jessitron:elm-rugs:AddTextInput input_name=favoriteColor`

### UpgradeToBeginnerProgram
If you have a Static Page, this moves the content of `main` into `view` and provides the outline of an Elm Beginner Program. (see: [The Elm Architecture](https://guide.elm-lang.org/architecture/))

### Organize
If you didn't start the project with a generator from here, and your Elm module is sitting there in your source directory right next to the index.html output by `elm make`, then this editor is for you. It moves Elm code under `src/`, creates a `resources` directory containing an index.html and styles.css, and provides a `build` script that will sends the output to a `target/` directory. Act now, and you'll get `.gitignore` for free!

Parameter:

* project_name: populates the title in index.html

### AddButton
Have a function that returns a button element, complete with onClick event that comes back to your update function.

Parameters:

* button_text: text to display on the button, like "Push Me"
* button_message: message to send on click, like `ButtonPushed`

### AddTextInput
This makes five changes: a field in the model (and its type), a message (and its clause in update), and a function that you can call in your view.

Parameter:

* new_input: id for the text field. For instance: `favoriteColor`

This'll give you a function `favoriteColorInput : Model -> Html Msg` which returns the text input element, which will save its content into a `favoriteColor` field in your model, by passing a `FavoriteColor` message.

### OnEnter
Create an `onEnter: Msg -> Html.Attribute Msg` function, useful in text inputs that want to respond to Enter. I copied the code for this function out of the Elm tutorial.

Parameter:

* enter_message: a message type, like `SaveFavoriteColor`. Figured we might as well add a message in the same step, since you're going to need to send one.


### UpgradeToProgram
This takes a Beginner Program up to a full program, so that you can add subscriptions and commands.

### SubscribeToClicks
Subscribe to mouse clicks, and save the mouse position of the last click in a model field called `lastClick`.

### SubscribeToWindowSize
Get the window size, both on initialization and at every resize. Store it in the model.

### FocusCommand 
Add a function `requestFocus: String -> Cmd Msg` that lets you send a focus request. Pass it a field ID. If that field doesn't exist, you'll hear about it in a `FieldIdNotFound` message, which you can spot in the debugger.

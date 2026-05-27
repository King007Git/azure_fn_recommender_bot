# data prerequisit
- columns needed are `Incident Number,Application,Short Description,Description,Category,Priority,Assignment Group,Opened Date,Resolved Date,Resolution Type,Resolution Notes,Issue Description,RCA,Workaround,Status,Server Platform,Database`,  columns names cannot be changes.
- new data needs to be index properly. click on the **index data** button in settings clicking multiple times result in duplicate record inset.

# embedding model download (one time):
- just run the `python model_download.py`.

# How to run (dev):
- download & install azure function core tools.
- in project folder open terminal and run command `func start`.
- in new termial window go to the **/client** folder.
- One time only do `npm i` in **/client** folder.
- to run the frontend, run `num run dev` in **/client** folder,

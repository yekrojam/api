# Settings

## Overview

All settings that are not core to an object can be stored in these settings object. These are atomic little bits of data that can be attached to any object.

## Structure

Each `setting` document has the following fields:
- *`target`*: An `id` for the object the setting belongs to (a membership, org, ...)
- *`targetRef`*: The type of the target object. This should be set in the discriminator class
- *`kind`*: The name of the subclass for this setting
- *`value`*: The value of the setting. Always have a default

## Using Settings

### Querying

You should query for a setting with the `target` and the `kind`. That should uniquely identify a specific setting object. You will always get an object back with that query since the API will create a new object if one isn't found. That way the API will always give you back the default setting for the object.

### Setting

You should set a `setting` by first reading it and then doing a PUT to the `id` of the setting. If you try to create a setting with a POST, you might get an error if the setting already exists since only one is allowed.

## Add a New `Setting`

`ApprovedCookieSetting` is a good example to follow. You'll field want to add a discriminator to the `/settingModel/discriminators` folder. That schema will need to do two things:
- Specify the validation and type for the value field.
- Specify a `targetRef` type so we know what type of object the target is.

The last step is adding the new discriminator to `/settingModel/index.js` which will make sure it gets loaded. This is necessary since the key is just running the discriminator code, which registers it on the `Setting` model. It doesn't need to be referenced anywhere outside of that.
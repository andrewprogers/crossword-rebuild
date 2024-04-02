#!/bin/zsh
( cd frontend \
  && npm run build \
  && rm -rf ../build \
  && cp -R ./build ../build \
) && \
pip freeze > requirements.txt
gcloud app deploy --project=cross-react --quiet \
&& curl https://cross-react.uw.r.appspot.com/api/user/
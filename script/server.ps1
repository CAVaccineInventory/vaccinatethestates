bundle install
npm install

if ($args.Length -gt 0 -and $args[0] -ieq "--prod") {
    npx nf start --procfile Procfile.prod
} else {
    npx nf start
}

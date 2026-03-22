$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
fnm env | Out-String | Invoke-Expression
fnm use 22
npm install -g pnpm
pnpm install
pnpm run dev

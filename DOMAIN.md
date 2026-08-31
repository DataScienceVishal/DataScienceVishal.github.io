# Putting the site on your own domain

The site is live at <https://datasciencevishal.github.io/>. That URL is already
fine on a CV. This is how to move it to a domain you own, using the free year
in the GitHub Student Developer Pack.

Nothing here needs a rebuild. The site is served from the repository root, so a
custom domain is a DNS change plus one setting, and the URL above keeps working
afterwards as a redirect.

## 1. Claim the domain

The pack includes one free year from Namecheap, on a `.me`. Sign in with your
GitHub account so it can see your student status:

<https://education.github.com/pack> → find Namecheap → **Get access**

Pick something a recruiter can read over the phone. `vishalkhan.me` if it is
free, otherwise `vishal-khan.me` or `vishalkhandata.me`. Avoid hyphens and
numbers if you can: this goes on a CV and gets typed by hand.

Namecheap's free `.me` renews at roughly £15 a year. Put a calendar reminder on
the renewal date now, because a lapsed domain on a CV is worse than never
having had one.

## 2. Point the DNS at GitHub

In Namecheap: **Domain List** → **Manage** → **Advanced DNS**. Delete the
parking records Namecheap adds by default, then add these five.

Four `A` records, all with host `@`:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

There are four because GitHub serves Pages from four addresses; listing all
four is what keeps the site up when one of them is not.

One `CNAME` record, for the `www` version:

| Type | Host | Value |
| --- | --- | --- |
| CNAME | `www` | `datasciencevishal.github.io.` |

The trailing dot on that value matters. Without it some DNS panels append your
own domain and the record resolves to nothing.

## 3. Tell GitHub the domain is yours

Once the DNS is saved, either run this:

```bash
gh api -X PUT repos/DataScienceVishal/DataScienceVishal.github.io/pages -f cname=vishalkhan.me
```

Or set it in the browser: repository → **Settings** → **Pages** → **Custom
domain**. Type the domain, press Save.

Then wait. DNS takes anywhere from ten minutes to a few hours to propagate.
Check it with:

```bash
dig +short vishalkhan.me
```

When that prints the four `185.199.*` addresses, GitHub can see it too.

## 4. Turn on HTTPS

Back in **Settings** → **Pages**, tick **Enforce HTTPS**. The checkbox stays
greyed out until GitHub has issued the certificate, which happens on its own
once the DNS resolves, usually within an hour.

Do not skip this. A portfolio served over plain HTTP shows a "Not secure"
warning in the address bar, which is the first thing a reader sees.

## 5. Check it

```bash
curl -sI https://vishalkhan.me | head -1
```

`HTTP/2 200` means done. Then open the site and confirm the 3D models load,
since those are the only assets fetched at an absolute path.

## If it breaks

**"Domain does not resolve to the GitHub Pages server."** The DNS has not
propagated yet, or a parking record is still there. Re-check that you deleted
Namecheap's default `CNAME` on `@`.

**The site loads but has no styling.** Something set a base path. This repo is
a user site served from the root, so `vite.config.ts` should have no `base`.

**HTTPS stays greyed out for over a day.** Remove the custom domain, save, add
it again. That re-triggers certificate issuance and is the standard fix.

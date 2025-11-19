# Spec Provenance
- **Created**: 2025-11-19
- **Project**: TaskMaster → IUUtask Rebranding
- **Request**: Change application branding from "TaskMaster" to "IUUtask" throughout the entire application

# Spec Header

## Name
Application Rebranding: TaskMaster → IUUtask

## Smallest Scope
Replace all occurrences of "TaskMaster" branding with "IUUtask" in:
- UI components (headers, auth pages)
- Metadata (page titles, descriptions)
- Documentation files (README, blueprints, WARP)
- Keep package.json name as "nextn" (internal identifier)
- Update taglines and descriptions to match new brand identity

## Non-Goals
- Not changing directory/folder names (keep `taskMaster` folder)
- Not changing repository name on GitHub
- Not changing deployment URLs (Netlify subdomain)
- Not changing Firebase project configuration
- Not changing internal code variable names or types
- Not creating new logo/favicon assets (use existing or none)

# Paths to Supplementary Guidelines
- Next.js metadata best practices: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- SEO guidelines for rebranding: https://developers.google.com/search/docs/crawling-indexing/301-redirects

# Decision Snapshot

## Context
User wants to rebrand the task management application from "TaskMaster" to "IUUtask" across all user-facing text and documentation. The current branding appears in:
- 7 files with direct "TaskMaster" references
- Page titles and meta descriptions
- Header components
- Authentication pages
- Documentation (README, WARP, blueprint)

## Key Constraints
- Must maintain internal consistency
- Should update all user-facing text
- Keep technical identifiers unchanged (folder names, package names)
- Preserve all existing functionality

## Chosen Path: Complete Text-Based Rebranding
**Why**: Clean, straightforward approach that updates all visible branding without disrupting infrastructure or deployment pipelines.

**Trade-offs**:
- ✅ Simple search-and-replace pattern
- ✅ No breaking changes to infrastructure
- ✅ Maintains SEO and deployment continuity
- ⚠️ Folder/repo names remain "taskMaster" (acceptable for internal use)

**Alternatives Considered**:
1. **Full infrastructure rename** (folder, repo, deployment URLs)
   - ❌ Too disruptive; breaks existing links
   - ❌ Requires redeployment configuration
   - ❌ Git history complications

2. **Gradual rollout with feature flags**
   - ❌ Overkill for simple text changes
   - ❌ Adds unnecessary complexity

# Architecture at a Glance

## Files Requiring Changes

### User-Facing Components
```
src/app/page.tsx          → Header title + tagline
src/app/auth/page.tsx     → Welcome message
src/app/layout.tsx        → Metadata (title + description)
```

### Documentation
```
README.md                 → Title, description, references
docs/blueprint.md         → App name header
WARP.md                   → Project description
```

## New Branding Elements

### Current Brand
- Name: "TaskMaster"
- Tagline: "Master your day. Bring clarity to your work."
- Meta Title: "TaskMaster: Master Your Day with Ease"
- Meta Description: "Effortlessly create, manage, and delete your tasks with TaskMaster..."

### New Brand
- Name: "IUUtask"
- Tagline: "Organize your tasks. Achieve your goals." (suggested)
- Meta Title: "IUUtask: Organize Your Tasks with Ease"
- Meta Description: "Effortlessly create, manage, and delete your tasks with IUUtask..."

## Branding Consistency Matrix

| Element | Current | New | File |
|---------|---------|-----|------|
| App Title | TaskMaster | IUUtask | page.tsx, auth/page.tsx |
| Meta Title | TaskMaster: Master Your Day | IUUtask: Organize Your Tasks | layout.tsx |
| Tagline | Master your day... | Organize your tasks... | page.tsx |
| Docs Title | TaskMaster | IUUtask | README.md, blueprint.md, WARP.md |

# Implementation Plan

## Phase 1: Core Application (Priority 1)

### Task 1.1: Update Main Page Header
**File**: `src/app/page.tsx` (line ~306)
```typescript
// FROM:
<h1 className="text-2xl font-headline font-bold tracking-tight">TaskMaster</h1>
<p className="text-sm text-muted-foreground">
  Master your day. Bring clarity to your work.
</p>

// TO:
<h1 className="text-2xl font-headline font-bold tracking-tight">IUUtask</h1>
<p className="text-sm text-muted-foreground">
  Organize your tasks. Achieve your goals.
</p>
```

### Task 1.2: Update Authentication Page
**File**: `src/app/auth/page.tsx` (line ~76)
```typescript
// FROM:
Welcome to TaskMaster

// TO:
Welcome to IUUtask
```

### Task 1.3: Update Metadata
**File**: `src/app/layout.tsx` (lines 7-8)
```typescript
// FROM:
export const metadata: Metadata = {
  title: 'TaskMaster: Master Your Day with Ease',
  description: 'Effortlessly create, manage, and delete your tasks with TaskMaster. Our clean and intuitive interface helps you stay organized and productive.',
};

// TO:
export const metadata: Metadata = {
  title: 'IUUtask: Organize Your Tasks with Ease',
  description: 'Effortlessly create, manage, and delete your tasks with IUUtask. Our clean and intuitive interface helps you stay organized and productive.',
};
```

## Phase 2: Documentation (Priority 2)

### Task 2.1: Update README.md
**File**: `README.md`

**Changes**:
- Line 1: `# TaskMaster - ...` → `# IUUtask - ...`
- Line 3: Replace all instances of "TaskMaster" with "IUUtask"
- Line 12: Update screenshot alt text (optional - image stays same)
- Keep demo URL as-is (deployment URL doesn't change)

### Task 2.2: Update Blueprint
**File**: `docs/blueprint.md` (line 1)
```markdown
# FROM:
# **App Name**: TaskMaster

# TO:
# **App Name**: IUUtask
```

### Task 2.3: Update WARP.md
**File**: `WARP.md` (line 7)
```markdown
# FROM:
TaskMaster is a Next.js 15 task management application...

# TO:
IUUtask is a Next.js 15 task management application...
```

## Phase 3: Verification (Priority 3)

### Task 3.1: Visual Inspection
- [ ] Load homepage - verify header shows "IUUtask"
- [ ] Check auth page - verify welcome message
- [ ] Inspect browser tab - verify page title
- [ ] View page source - verify meta description

### Task 3.2: Documentation Review
- [ ] Read README - ensure consistency
- [ ] Check blueprint - verify app name
- [ ] Review WARP - confirm description

### Task 3.3: Search Verification
```bash
# Verify no remaining "TaskMaster" in user-facing files
grep -r "TaskMaster" src/app/
grep -r "TaskMaster" README.md docs/ WARP.md
```

# Verification & Demo Script

## Pre-Implementation Checklist
- [ ] Create feature branch: `git checkout -b rebrand/taskmaster-to-iuutask`
- [ ] Confirm dev server is running
- [ ] Take screenshots of current branding (before)

## Implementation Steps
```bash
# 1. Update main page
# Edit src/app/page.tsx (lines 306-308)

# 2. Update auth page  
# Edit src/app/auth/page.tsx (line 76)

# 3. Update metadata
# Edit src/app/layout.tsx (lines 7-8)

# 4. Update README
# Edit README.md (lines 1, 3, 7, 12)

# 5. Update blueprint
# Edit docs/blueprint.md (line 1)

# 6. Update WARP
# Edit WARP.md (line 7)

# 7. Verify changes
npm run typecheck
grep -r "TaskMaster" src/app/ README.md docs/ WARP.md
```

## Visual Testing Protocol

### Test 1: Homepage Header
1. Navigate to http://localhost:9002
2. Verify header shows "IUUtask" (not "TaskMaster")
3. Verify tagline reads "Organize your tasks. Achieve your goals."

### Test 2: Browser Tab Title
1. Check browser tab text
2. Should read: "IUUtask: Organize Your Tasks with Ease"

### Test 3: Authentication Page
1. Sign out (if signed in)
2. Navigate to /auth
3. Verify welcome message: "Welcome to IUUtask"

### Test 4: Meta Tags (SEO)
1. Right-click page → View Page Source
2. Find `<title>` tag → should be "IUUtask: Organize Your Tasks with Ease"
3. Find `<meta name="description">` → should mention "IUUtask"

### Test 5: Documentation Consistency
1. Open README.md in GitHub/editor
2. Verify all references are "IUUtask"
3. Check blueprint and WARP for consistency

## Post-Implementation Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Documentation updated
- [ ] Screenshots taken (after)
- [ ] Commit with message: `feat: rebrand TaskMaster to IUUtask`

## Demo Flow for Stakeholder Review
1. **Show before screenshots** (old "TaskMaster" branding)
2. **Live demo walkthrough**:
   - Homepage with new header
   - Auth page with welcome message
   - Browser tab showing new title
3. **Documentation review**:
   - README with new branding
   - Blueprint updated
4. **Technical verification**:
   - Search results showing no remaining "TaskMaster"
   - TypeScript compilation success

# Deploy

## Pre-Deployment
```bash
# Ensure all changes committed
git status

# Run final checks
npm run typecheck
npm run build

# Verify build output
npm run start
# Test at http://localhost:3000
```

## Deployment Steps

### Option 1: Push to Main (Auto-Deploy)
```bash
git add .
git commit -m "feat: rebrand TaskMaster to IUUtask

- Update app header and tagline
- Update metadata (title and description)  
- Update auth page welcome message
- Update all documentation (README, blueprint, WARP)
- Maintain internal identifiers (package name, folders)"

git push origin main
# Netlify auto-deploys from main branch
```

### Option 2: Preview Deploy (Recommended)
```bash
# Push to feature branch first
git push origin rebrand/taskmaster-to-iuutask

# Netlify creates preview deploy
# Review at: https://deploy-preview-[PR-NUM]--taskmasteryk.netlify.app

# If approved, merge to main
```

## Post-Deployment Verification
1. Visit production URL: https://taskmasteryk.netlify.app
2. Verify new branding appears correctly
3. Check browser tab title
4. Test authentication flow
5. Verify mobile responsive design maintained

## Rollback Plan
If issues arise:
```bash
# Revert commit
git revert HEAD
git push origin main

# OR reset to previous commit
git reset --hard [COMMIT_HASH]
git push origin main --force
```

## SEO Considerations
- No URL changes needed (routes stay same)
- Meta tags updated for search engines
- Consider updating social media links/posts
- Monitor Google Search Console for any indexing issues

## Success Metrics
- ✅ Zero "TaskMaster" references in user-facing text
- ✅ All pages load without errors
- ✅ Meta tags correctly updated
- ✅ Documentation consistent across all files
- ✅ Build and deploy successful

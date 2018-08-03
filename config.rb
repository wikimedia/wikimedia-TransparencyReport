###
# Compass
###


###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

activate :i18n, :langs => [:en, :fr]

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'
set :relative_links, true

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  # optimize all images
  activate :imageoptim

  # minify HTML
  activate :minify_html
  # Enable cache buster
  # activate :asset_hash

  # Use relative URLs
  # activate :relative_assets

  # Or use a different image path
  # set :http_prefix, "/Content/images/"
end

helpers do
  # Remove lang prefix for page classes
  def page_classes(path=current_path.dup, options={})
    super(path.sub(/^[a-z]{2}\//, ''), options)
  end

  def locale_url(url)
    unless I18n.locale.to_s == "en"
      return "/#{I18n.locale}#{url}"
    else
      return url
    end
  end

  def navigation_link(label, url)
    current = false
    if url == '/'
      current = url == '/' && current_page.path == 'index.html'
    else
      current = "/#{current_page.path}".include?(url)
    end
    "<a href='#{url}' #{'class="current"' if current}>#{label}</a>"
  end
end

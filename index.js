const puppeteer = require("puppeteer")

const crawl = async () => {
	const browser = await puppeteer.launch({ headless: true }) // Run headless (faster)
	const page = await browser.newPage()

	const url = "https://amzn.eu/d/35oVYbD"
	await page.goto(url, { waitUntil: "load" })

	class Fields {
		constructor(name, selector, formatter, value) {
			if (!name || !selector) {
				throw new Error("Name and selector are required")
			}
			this.name = name
			this.selector = selector
		}
		set(value) {
			this.value = !!this.formatter ? this.formatter(value) : value
		}
		get() {
			if (this.value) return { [this.name]: this.value }
		}
		static getAll(FieldsArray) {
			return [...FieldsArray.filter((filtered) => !!filtered.value).map((field) => field.get())]
		}
	}

	const amazonFields = [
		new Fields("price", "#corePrice_feature_div .a-price .a-offscreen"),
		new Fields("title", "#productTitle"),
		new Fields("url", "link", undefined, url),
		new Fields("images", "img"),
		new Fields("description", "#productDescription"),
		new Fields("color", "#variation_color_name"),
	]

	// const objectSelectors = { title: "", price: "", url: "", images: [], description: "", color: "" }
	for (const field of amazonFields) {
		console.log(field.selector)
		try {
			field.set(await page.$eval(field.selector, (el) => el.innerText))
		} catch (error) {
			console.log(`Error extracting ${field.name}: ${error.message}`)
		}
	}

	console.log(Fields.getAll(amazonFields))

	await browser.close()
}
crawl()
